import fs from "node:fs";
import path from "node:path";
import { MUSIC_PRESETS, SFX_PRESETS } from "@/lib/audio-presets";

export const ELEVENLABS_BASE_URL = "https://api.elevenlabs.io/v1";
export const MAX_TTS_CHARACTERS = 3000;
export const MAX_SFX_PROMPT_CHARS = 500;
export const MAX_VERCEL_AUDIO_BASE64_CHARS = 3_500_000;

export interface ElevenLabsVoiceRaw {
  voice_id: string;
  name: string;
  category?: string;
  labels?: Record<string, string>;
  preview_url?: string;
}

export interface NormalizedVoice {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  preview_url: string | null;
}

export function getRendererUrl(): string {
  const raw =
    process.env.RENDERER_URL ||
    process.env.NEXT_PUBLIC_RENDERER_URL ||
    "https://zyrvae-video-renderer.onrender.com";
  return raw ? raw.trim().replace(/\/$/, "") : "";
}

export function isPublicHttpsUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    if (!host || host === "localhost" || host === "127.0.0.1" || host === "::1") {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function getPublicRendererUrl(backendFallback = ""): string {
  const candidates = [
    process.env.RENDERER_PUBLIC_URL?.trim() || "",
    process.env.NEXT_PUBLIC_RENDERER_URL?.trim() || "",
    backendFallback.trim(),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const clean = candidate.replace(/\/$/, "");
    if (isPublicHttpsUrl(clean)) return clean;
  }

  return "";
}

export function getAudioPresetAvailability() {
  const publicDir = path.join(process.cwd(), "public");

  const musicAvailability: Record<string, boolean> = {};
  const music = MUSIC_PRESETS.map((preset) => {
    const relativePath = preset.previewPath.replace(/^\//, "");
    const available = fs.existsSync(path.join(publicDir, relativePath));
    musicAvailability[preset.id] = available;
    return { ...preset, available };
  });

  const sfxAvailability: Record<string, boolean> = {};
  const sfx = SFX_PRESETS.map((preset) => {
    const relativePath = preset.previewPath.replace(/^\//, "");
    const available = fs.existsSync(path.join(publicDir, relativePath));
    sfxAvailability[preset.id] = available;
    return { ...preset, available };
  });

  return { musicAvailability, sfxAvailability, music, sfx };
}

export function getElevenLabsApiKey(): string | null {
  const key = process.env.ELEVENLABS_API_KEY?.trim();
  return key || null;
}

export function clampUnit(value: unknown, fallback: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(1, Math.max(0, num));
}

export function extractElevenLabsErrorMessage(rawText: string, status: number): string {
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

export async function fetchElevenLabsVoices(): Promise<{
  ok: boolean;
  configured: boolean;
  status: number;
  voices: NormalizedVoice[];
  error?: string;
  details?: string;
  upstreamStatus?: number;
}> {
  const apiKey = getElevenLabsApiKey();
  if (!apiKey) {
    return {
      ok: false,
      configured: false,
      status: 503,
      voices: [],
      error: "ELEVENLABS_API_KEY no está configurada en las variables de entorno del servidor.",
    };
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
      return {
        ok: false,
        configured: true,
        status: mappedStatus,
        upstreamStatus: response.status,
        voices: [],
        error: readableError,
        details: errorText.slice(0, 300),
      };
    }

    const data = (await response.json()) as { voices?: ElevenLabsVoiceRaw[] };
    const voices: NormalizedVoice[] = Array.isArray(data.voices)
      ? data.voices.map((v) => ({
          voice_id: v.voice_id,
          name: v.name,
          category: v.category || "general",
          labels: v.labels || {},
          preview_url: v.preview_url || null,
        }))
      : [];

    return {
      ok: true,
      configured: true,
      status: 200,
      voices,
    };
  } catch (err: unknown) {
    return {
      ok: false,
      configured: true,
      status: 502,
      voices: [],
      error: "No se pudo consultar la lista de voces en ElevenLabs.",
      details: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function synthesizeElevenLabsVoice(input: {
  text: string;
  voiceId: string;
  stability?: number;
  similarityBoost?: number;
}): Promise<{
  ok: boolean;
  status: number;
  mimeType?: "audio/mpeg";
  ext?: "mp3";
  sizeBytes?: number;
  base64?: string;
  error?: string;
  details?: string;
}> {
  const apiKey = getElevenLabsApiKey();
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      error: "ELEVENLABS_API_KEY no está configurada en el servidor. Agregala en Vercel/entorno local.",
    };
  }

  const text = input.text.trim();
  const voiceId = input.voiceId.trim();

  if (!text) {
    return {
      ok: false,
      status: 400,
      error: "El guion de texto para la voz en off no puede estar vacío.",
    };
  }
  if (text.length > MAX_TTS_CHARACTERS) {
    return {
      ok: false,
      status: 400,
      error: `El texto supera el límite de ${MAX_TTS_CHARACTERS} caracteres (${text.length}).`,
    };
  }
  if (!voiceId || !/^[a-zA-Z0-9_-]+$/.test(voiceId)) {
    return {
      ok: false,
      status: 400,
      error: "Debes seleccionar un voiceId válido.",
    };
  }

  const stability = clampUnit(input.stability, 0.5);
  const similarityBoost = clampUnit(input.similarityBoost, 0.75);

  try {
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
      return {
        ok: false,
        status:
          ttsResponse.status >= 400 && ttsResponse.status < 500
            ? ttsResponse.status
            : 502,
        error: extractElevenLabsErrorMessage(errText, ttsResponse.status),
        details: errText.slice(0, 400),
      };
    }

    const arrayBuffer = await ttsResponse.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);
    if (audioBuffer.byteLength === 0) {
      return {
        ok: false,
        status: 502,
        error: "ElevenLabs devolvió un archivo de audio vacío.",
      };
    }

    return {
      ok: true,
      status: 200,
      mimeType: "audio/mpeg",
      ext: "mp3",
      sizeBytes: audioBuffer.byteLength,
      base64: audioBuffer.toString("base64"),
    };
  } catch (err: unknown) {
    return {
      ok: false,
      status: 500,
      error: "Error inesperado generando la locución con ElevenLabs.",
      details: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function generateElevenLabsSfx(input: {
  text: string;
  durationSeconds?: number;
  promptInfluence?: number;
}): Promise<{
  ok: boolean;
  status: number;
  mimeType?: "audio/mpeg";
  ext?: "mp3";
  sizeBytes?: number;
  base64?: string;
  error?: string;
  details?: string;
}> {
  const apiKey = getElevenLabsApiKey();
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      error: "ELEVENLABS_API_KEY no está configurada en el servidor para generar efectos SFX.",
    };
  }

  const text = input.text.trim();
  if (!text) {
    return {
      ok: false,
      status: 400,
      error: "La descripción del efecto de sonido (text) es obligatoria.",
    };
  }
  if (text.length > MAX_SFX_PROMPT_CHARS) {
    return {
      ok: false,
      status: 400,
      error: `La descripción supera el límite de ${MAX_SFX_PROMPT_CHARS} caracteres.`,
    };
  }

  const rawDuration = Number(input.durationSeconds);
  const durationSeconds = Number.isFinite(rawDuration)
    ? Math.min(22, Math.max(0.5, rawDuration))
    : 1.5;
  const rawInfluence = Number(input.promptInfluence);
  const promptInfluence = Number.isFinite(rawInfluence)
    ? Math.min(1, Math.max(0, rawInfluence))
    : 0.35;

  try {
    const sfxRes = await fetch(`${ELEVENLABS_BASE_URL}/sound-generation`, {
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
      return {
        ok: false,
        status: sfxRes.status >= 400 && sfxRes.status < 500 ? sfxRes.status : 502,
        error: extractElevenLabsErrorMessage(errText, sfxRes.status),
        details: errText.slice(0, 400),
      };
    }

    const arrayBuffer = await sfxRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.byteLength === 0) {
      return {
        ok: false,
        status: 502,
        error: "ElevenLabs devolvió un SFX vacío.",
      };
    }

    return {
      ok: true,
      status: 200,
      mimeType: "audio/mpeg",
      ext: "mp3",
      sizeBytes: buffer.byteLength,
      base64: buffer.toString("base64"),
    };
  } catch (err: unknown) {
    return {
      ok: false,
      status: 500,
      error: "Error inesperado generando SFX con ElevenLabs.",
      details: err instanceof Error ? err.message : String(err),
    };
  }
}
