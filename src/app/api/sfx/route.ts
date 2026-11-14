import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ELEVENLABS_SFX_URL = "https://api.elevenlabs.io/v1/sound-generation";
const MAX_SFX_PROMPT_CHARS = 500;

function getElevenLabsApiKey(): string | null {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  return key || null;
}

export async function POST(request: Request) {
  const apiKey = getElevenLabsApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "ELEVENLABS_API_KEY no está configurada en el servidor para generar efectos SFX.",
      },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json().catch(() => null)) as {
      text?: unknown;
      durationSeconds?: unknown;
      promptInfluence?: unknown;
    } | null;

    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json(
        { error: "La descripción del efecto de sonido (text) es obligatoria." },
        { status: 400 }
      );
    }

    if (text.length > MAX_SFX_PROMPT_CHARS) {
      return NextResponse.json(
        {
          error: `La descripción supera el límite de ${MAX_SFX_PROMPT_CHARS} caracteres.`,
        },
        { status: 400 }
      );
    }

    const rawDuration = Number(body?.durationSeconds);
    const durationSeconds = Number.isFinite(rawDuration)
      ? Math.min(22, Math.max(0.5, rawDuration))
      : 1.5;

    const rawInfluence = Number(body?.promptInfluence);
    const promptInfluence = Number.isFinite(rawInfluence)
      ? Math.min(1, Math.max(0, rawInfluence))
      : 0.35;

    const sfxRes = await fetch(ELEVENLABS_SFX_URL, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        duration_seconds: durationSeconds,
        prompt_influence: promptInfluence,
      }),
      signal: AbortSignal.timeout(45000),
    });

    if (!sfxRes.ok) {
      const errText = await sfxRes.text().catch(() => "");
      return NextResponse.json(
        {
          error: `ElevenLabs SFX respondió con estado ${sfxRes.status}.`,
          details: errText.slice(0, 400),
        },
        { status: sfxRes.status >= 400 && sfxRes.status < 500 ? sfxRes.status : 502 }
      );
    }

    const arrayBuffer = await sfxRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.byteLength === 0) {
      return NextResponse.json(
        { error: "ElevenLabs devolvió un SFX vacío." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      mimeType: "audio/mpeg",
      ext: "mp3",
      sizeBytes: buffer.byteLength,
      base64: buffer.toString("base64"),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Error inesperado generando el efecto SFX con ElevenLabs.",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
