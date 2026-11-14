import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";
const MAX_TTS_CHARACTERS = 3000;

interface ElevenLabsVoiceRaw {
  voice_id: string;
  name: string;
  category?: string;
  labels?: Record<string, string>;
  preview_url?: string;
}

function getElevenLabsApiKey(): string | null {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  return key || null;
}

function clampUnit(value: unknown, fallback: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(1, Math.max(0, num));
}

function extractElevenLabsErrorMessage(rawText: string, status: number): string {
  const trimmed = rawText.trim();
  if (trimmed) {
    try {
      const parsed = JSON.parse(trimmed) as {
        detail?: string | { message?: string; status?: string };
        error?: string;
        message?: string;
      };
      if (typeof parsed.detail === "string" && parsed.detail.trim()) {
        return `ElevenLabs (${status}): ${parsed.detail.trim()}`;
      }
      if (parsed.detail && typeof parsed.detail === "object" && parsed.detail.message) {
        return `ElevenLabs (${status}): ${parsed.detail.message}`;
      }
      if (parsed.error) return `ElevenLabs (${status}): ${parsed.error}`;
      if (parsed.message) return `ElevenLabs (${status}): ${parsed.message}`;
    } catch {}
    return `ElevenLabs (${status}): ${trimmed.slice(0, 240)}`;
  }

  if (status === 401) {
    return "ElevenLabs (401): ELEVENLABS_API_KEY inválida o sin permisos.";
  }
  if (status === 429) {
    return "ElevenLabs (429): Límite de velocidad o cuota alcanzada temporalmente.";
  }
  return `ElevenLabs respondió con estado ${status}.`;
}

export async function GET() {
  const apiKey = getElevenLabsApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        configured: false,
        voices: [],
        error:
          "ELEVENLABS_API_KEY no está configurada en las variables de entorno del servidor.",
      },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${ELEVENLABS_BASE_URL}/voices`, {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      const readableError = extractElevenLabsErrorMessage(errorText, response.status);
      // Nunca devolver 503 cuando la key existe, para no confundirlo con variable faltante
      const mappedStatus =
        response.status === 401 || response.status === 429
          ? response.status
          : response.status >= 500
            ? 502
            : response.status;
      return NextResponse.json(
        {
          configured: true,
          voices: [],
          upstreamStatus: response.status,
          error: readableError,
          details: errorText.slice(0, 300),
        },
        { status: mappedStatus }
      );
    }

    const data = (await response.json()) as { voices?: ElevenLabsVoiceRaw[] };
    const voices = Array.isArray(data.voices)
      ? data.voices.map((v) => ({
          voice_id: v.voice_id,
          name: v.name,
          category: v.category || "general",
          labels: v.labels || {},
          preview_url: v.preview_url || null,
        }))
      : [];

    return NextResponse.json({
      configured: true,
      voices,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        configured: true,
        voices: [],
        error: "No se pudo consultar la lista de voces en ElevenLabs.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const apiKey = getElevenLabsApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ELEVENLABS_API_KEY no está configurada en el servidor. Agregala en Vercel/entorno local.",
      },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json().catch(() => null)) as {
      text?: unknown;
      voiceId?: unknown;
      stability?: unknown;
      similarityBoost?: unknown;
    } | null;

    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const voiceId = typeof body?.voiceId === "string" ? body.voiceId.trim() : "";

    if (!text) {
      return NextResponse.json(
        { error: "El guion de texto para la voz en off no puede estar vacío." },
        { status: 400 }
      );
    }

    if (text.length > MAX_TTS_CHARACTERS) {
      return NextResponse.json(
        {
          error: `El texto supera el límite de ${MAX_TTS_CHARACTERS} caracteres (${text.length}).`,
        },
        { status: 400 }
      );
    }

    if (!voiceId || !/^[a-zA-Z0-9_-]+$/.test(voiceId)) {
      return NextResponse.json(
        { error: "Debes seleccionar un voiceId válido." },
        { status: 400 }
      );
    }

    const stability = clampUnit(body?.stability, 0.5);
    const similarityBoost = clampUnit(body?.similarityBoost, 0.75);

    const ttsResponse = await fetch(
      `${ELEVENLABS_BASE_URL}/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
          },
        }),
        signal: AbortSignal.timeout(45000),
      }
    );

    if (!ttsResponse.ok) {
      const errText = await ttsResponse.text().catch(() => "");
      return NextResponse.json(
        {
          error: extractElevenLabsErrorMessage(errText, ttsResponse.status),
          details: errText.slice(0, 400),
        },
        { status: ttsResponse.status >= 400 && ttsResponse.status < 500 ? ttsResponse.status : 502 }
      );
    }

    const arrayBuffer = await ttsResponse.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);
    if (audioBuffer.byteLength === 0) {
      return NextResponse.json(
        { error: "ElevenLabs devolvió un archivo de audio vacío." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      mimeType: "audio/mpeg",
      ext: "mp3",
      sizeBytes: audioBuffer.byteLength,
      base64: audioBuffer.toString("base64"),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Error inesperado generando la locución con ElevenLabs.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
