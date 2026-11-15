import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { parseSfxFromHtml } from "@/lib/audio-presets";
import {
  fetchElevenLabsVoices,
  generateElevenLabsSfx,
  getAudioPresetAvailability,
  getPublicRendererUrl,
  getRendererUrl,
  MAX_SFX_PROMPT_CHARS,
  MAX_TTS_CHARACTERS,
  MAX_VERCEL_AUDIO_BASE64_CHARS,
  synthesizeElevenLabsVoice,
} from "@/lib/studio-server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ASPECT_RATIO_DIMENSIONS = {
  "9:16": { width: 1080, height: 1920 },
  "16:9": { width: 1920, height: 1080 },
  "1:1": { width: 1080, height: 1080 },
} as const;

function jsonToolResult(payload: unknown, isError = false) {
  return {
    ...(isError ? { isError: true } : {}),
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

function isAuthorizedMcpRequest(request: Request): boolean {
  const expectedToken = process.env.MCP_API_KEY?.trim();
  if (!expectedToken) return false;

  const authHeader = request.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(authHeader);
  if (!match) return false;

  const providedToken = match[1].trim();
  const expectedBuf = Buffer.from(expectedToken, "utf8");
  const providedBuf = Buffer.from(providedToken, "utf8");
  if (expectedBuf.length !== providedBuf.length) return false;

  return timingSafeEqual(expectedBuf, providedBuf);
}

const mcpHandler = createMcpHandler(
  (server) => {
    server.registerTool(
      "get_studio_rules",
      {
        title: "Obtener Reglas Técnicas del Estudio",
        description:
          "Devuelve las reglas técnicas vigentes para generar anuncios HTML válidos en ZYRVAE Media Studio (resoluciones, FPS, animaciones WAAPI/CSS desde 0s, overflow: hidden, Safe Zones y convención <meta name=\"zyrvae-sfx\">).",
        inputSchema: z.object({
          aspectRatio: z
            .enum(["9:16", "16:9", "1:1"])
            .optional()
            .describe("Proporción objetivo: 9:16, 16:9 o 1:1 (default 9:16)"),
          durationSec: z
            .number()
            .min(1)
            .max(120)
            .optional()
            .describe("Duración objetivo en segundos (1 a 120, default 15)"),
          fps: z
            .union([z.literal(30), z.literal(60)])
            .optional()
            .describe("Frecuencia de cuadros: 30 o 60 FPS (default 30)"),
        }),
      },
      async ({ aspectRatio = "9:16", durationSec = 15, fps = 30 }) => {
        const dims = ASPECT_RATIO_DIMENSIONS[aspectRatio];
        const totalFrames = Math.round(durationSec * fps);

        return jsonToolResult({
          studio: "ZYRVAE Media Studio",
          targetConfig: {
            aspectRatio,
            width: dims.width,
            height: dims.height,
            durationSec,
            fps,
            totalFrames,
          },
          supportedFormats: ASPECT_RATIO_DIMENSIONS,
          supportedFps: [30, 60],
          durationRangeSec: { min: 1, max: 120 },
          safeZones: {
            "9:16": {
              topPercent: 15,
              bottomPercent: 22,
              rightPercent: 12,
              note: "Evitá colocar titulares o CTAs críticos en estas franjas para no chocar con UI de Reels/TikTok/Shorts.",
            },
            "16:9": { note: "Margen de resguardo recomendado: 5-8% en bordes." },
            "1:1": { note: "Margen de resguardo recomendado: 6-8% en bordes." },
          },
          sfxMetaConvention: {
            tagExample:
              '<meta name="zyrvae-sfx" content="impact@2.0, ui-click@11.5, whoosh@15.0@0.8">',
            alternatives: [
              'data-sfx="impact@2.0,whoosh@15.0" en <body>',
              "<!-- zyrvae-sfx: impact@2.0, whoosh@15.0 -->",
            ],
            format: "<sfxId>@<segundos>[@<volumen 0.1-1.0>]",
            availablePresetIds: [
              "impact",
              "whoosh",
              "ui-click",
              "notification",
              "riser",
              "error-beep",
            ],
          },
          technicalRules: [
            "Archivo HTML único y 100% autocontenido (<style> y <script> embebidos, sin assets locales relativos).",
            "Cero interactividad humana: sin botones Play/Pause, ni esperas por click/hover, ni <video> externos inestables.",
            "Animaciones continuas con WAAPI (element.animate) o CSS @keyframes comenzando automáticamente en 0s (animation-delay: 0s o sincronizado en el ciclo).",
            "Priorizar propiedades GPU (transform, opacity) sobre propiedades de layout.",
            "Aplicar html, body { width: 100%; height: 100%; margin: 0; padding: 0; overflow: hidden; box-sizing: border-box; } para evitar scrollbars o desbordes.",
            `Sincronizar toda la coreografía exactamente a ${durationSec}s (${totalFrames} cuadros a ${fps} FPS).`,
          ],
        });
      }
    );

    server.registerTool(
      "list_audio_presets",
      {
        title: "Listar Presets de Música y SFX",
        description:
          "Devuelve el catálogo completo de presets de música de fondo y efectos de sonido (SFX) indicando cuáles tienen su .mp3 listo en disco.",
        inputSchema: z.object({}),
      },
      async () => {
        const availability = getAudioPresetAvailability();
        return jsonToolResult({
          musicPresets: availability.music,
          sfxPresets: availability.sfx,
        });
      }
    );

    server.registerTool(
      "list_voices",
      {
        title: "Listar Voces de ElevenLabs",
        description:
          "Lista las voces disponibles en ElevenLabs usando la clave configurada en el servidor (ELEVENLABS_API_KEY).",
        inputSchema: z.object({}),
      },
      async () => {
        const res = await fetchElevenLabsVoices();
        if (!res.ok) {
          return jsonToolResult(
            {
              configured: res.configured,
              status: res.status,
              error: res.error,
              details: res.details,
            },
            true
          );
        }

        return jsonToolResult({
          configured: true,
          count: res.voices.length,
          voices: res.voices,
        });
      }
    );

    server.registerTool(
      "generate_voiceover",
      {
        title: "Generar Voz en Off (ElevenLabs TTS)",
        description:
          "Genera una locución MP3 en base64 usando ElevenLabs (modelo eleven_multilingual_v2, mp3_44100_128).",
        inputSchema: z.object({
          text: z
            .string()
            .min(1)
            .max(MAX_TTS_CHARACTERS)
            .describe("Guion de voz en off (máx. 3000 caracteres)"),
          voiceId: z.string().min(1).describe("ID de voz obtenido de list_voices"),
          stability: z.number().min(0).max(1).optional().describe("Estabilidad (0..1, default 0.5)"),
          similarityBoost: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("Similitud con la voz original (0..1, default 0.75)"),
        }),
      },
      async ({ text, voiceId, stability, similarityBoost }) => {
        const res = await synthesizeElevenLabsVoice({
          text,
          voiceId,
          stability,
          similarityBoost,
        });

        if (!res.ok) {
          return jsonToolResult(
            { status: res.status, error: res.error, details: res.details },
            true
          );
        }

        return jsonToolResult({
          mimeType: res.mimeType,
          ext: res.ext,
          sizeBytes: res.sizeBytes,
          base64: res.base64,
        });
      }
    );

    server.registerTool(
      "generate_sfx",
      {
        title: "Generar Efecto de Sonido (ElevenLabs SFX)",
        description:
          "Genera un efecto de sonido puntual en MP3 base64 usando ElevenLabs Sound Effects.",
        inputSchema: z.object({
          prompt: z
            .string()
            .min(1)
            .max(MAX_SFX_PROMPT_CHARS)
            .describe("Descripción del sonido en inglés o español (máx. 500 caracteres)"),
          durationSeconds: z
            .number()
            .min(0.5)
            .max(22)
            .optional()
            .describe("Duración aproximada en segundos (0.5 a 22, default 1.5)"),
          promptInfluence: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("Adherencia al prompt (0..1, default 0.35)"),
        }),
      },
      async ({ prompt, durationSeconds, promptInfluence }) => {
        const res = await generateElevenLabsSfx({
          text: prompt,
          durationSeconds,
          promptInfluence,
        });

        if (!res.ok) {
          return jsonToolResult(
            { status: res.status, error: res.error, details: res.details },
            true
          );
        }

        return jsonToolResult({
          mimeType: res.mimeType,
          ext: res.ext,
          sizeBytes: res.sizeBytes,
          base64: res.base64,
        });
      }
    );

    server.registerTool(
      "start_render",
      {
        title: "Iniciar Renderizado MP4",
        description:
          "Encola un trabajo asíncrono de renderizado HTML-a-MP4 en renderer-service y devuelve el jobId. Si no se pasa sfxEvents, parsea automáticamente <meta name=\"zyrvae-sfx\"> desde el HTML. Podés pasar voiceoverText + voiceoverVoiceId para generar la voz en off directo en el servidor sin transferir Base64 por el contexto MCP.",
        inputSchema: z.object({
          html: z.string().min(1).describe("Documento HTML autónomo completo"),
          filename: z.string().optional().describe("Nombre/título del video a renderizar"),
          duration: z
            .number()
            .min(1)
            .max(120)
            .optional()
            .describe("Duración en segundos (1..120, default 15)"),
          aspectRatio: z
            .enum(["9:16", "16:9", "1:1"])
            .optional()
            .describe("Relación de aspecto: 9:16, 16:9 o 1:1 (default 9:16)"),
          fps: z
            .union([z.literal(30), z.literal(60)])
            .optional()
            .describe("Cuadros por segundo: 30 o 60 (default 30)"),
          musicPresetId: z
            .string()
            .optional()
            .describe("ID de preset de música (ej. dark-tech, minimal-editorial, saas-energy, ambient-luxury)"),
          audioBase64: z.string().optional().describe("Música de fondo personalizada en base64"),
          audioExt: z.string().optional().describe("Extensión de música personalizada (ej. mp3, wav)"),
          voiceoverText: z
            .string()
            .min(1)
            .max(MAX_TTS_CHARACTERS)
            .optional()
            .describe("Guion para generar la voz en off con ElevenLabs directo en el servidor (evita pasar Base64 por MCP)"),
          voiceoverVoiceId: z
            .string()
            .min(1)
            .optional()
            .describe("ID de voz de ElevenLabs para voiceoverText (obtenido de list_voices)"),
          voiceoverStability: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("Estabilidad para voiceoverText (0..1, default 0.5)"),
          voiceoverSimilarityBoost: z
            .number()
            .min(0)
            .max(1)
            .optional()
            .describe("Similitud con la voz original para voiceoverText (0..1, default 0.75)"),
          voiceoverBase64: z
            .string()
            .optional()
            .describe("Voz en off MP3 en base64 (opcional si no se usa voiceoverText)"),
          voiceoverExt: z.string().optional().describe("Extensión de voz en off (default mp3)"),
          sfxEvents: z
            .array(
              z.object({
                id: z.string().min(1),
                timeSec: z.number().min(0),
                volume: z.number().min(0.1).max(1).optional(),
                label: z.string().optional(),
                customBase64: z.string().optional(),
              })
            )
            .optional()
            .describe(
              "Lista explícita de eventos SFX; si se omite, se detectan automáticamente desde <meta name=\"zyrvae-sfx\"> en el HTML"
            ),
        }),
      },
      async ({
        html,
        filename = "Comercial ZYRVAE",
        duration = 15,
        aspectRatio = "9:16",
        fps = 30,
        musicPresetId,
        audioBase64,
        audioExt,
        voiceoverText,
        voiceoverVoiceId,
        voiceoverStability,
        voiceoverSimilarityBoost,
        voiceoverBase64,
        voiceoverExt,
        sfxEvents,
      }) => {
        const backendUrl = getRendererUrl();
        if (!backendUrl) {
          return jsonToolResult({ error: "RENDERER_URL no está configurada." }, true);
        }

        const resolvedAudioBase64 = audioBase64?.trim() || "";
        let resolvedVoiceoverBase64 = voiceoverBase64?.trim() || "";
        let resolvedVoiceoverExt = voiceoverExt || (resolvedVoiceoverBase64 ? "mp3" : null);
        let voiceoverSource: "none" | "base64" | "elevenlabs_server" = resolvedVoiceoverBase64
          ? "base64"
          : "none";
        let voiceoverSizeBytes: number | null = resolvedVoiceoverBase64
          ? Buffer.byteLength(resolvedVoiceoverBase64, "base64")
          : null;

        if (!resolvedVoiceoverBase64 && voiceoverText?.trim()) {
          const cleanVoiceId = voiceoverVoiceId?.trim() || "";
          if (!cleanVoiceId) {
            return jsonToolResult(
              {
                error:
                  "Debes proporcionar voiceoverVoiceId junto con voiceoverText (obtenelo con list_voices).",
              },
              true
            );
          }

          const ttsRes = await synthesizeElevenLabsVoice({
            text: voiceoverText,
            voiceId: cleanVoiceId,
            stability: voiceoverStability,
            similarityBoost: voiceoverSimilarityBoost,
          });

          if (!ttsRes.ok || !ttsRes.base64) {
            return jsonToolResult(
              {
                error: ttsRes.error || "No se pudo sintetizar la voz en off en el servidor.",
                status: ttsRes.status,
                details: ttsRes.details,
              },
              true
            );
          }

          resolvedVoiceoverBase64 = ttsRes.base64;
          resolvedVoiceoverExt = ttsRes.ext || "mp3";
          voiceoverSource = "elevenlabs_server";
          voiceoverSizeBytes = ttsRes.sizeBytes ?? null;
        }

        const resolvedSfxEvents =
          sfxEvents !== undefined
            ? sfxEvents.map((ev) => ({
                ...ev,
                volume: ev.volume ?? 0.85,
              }))
            : parseSfxFromHtml(html);

        const sfxBase64Len = resolvedSfxEvents.reduce(
          (acc, ev) => acc + (typeof ev.customBase64 === "string" ? ev.customBase64.length : 0),
          0
        );

        if (
          resolvedAudioBase64.length + resolvedVoiceoverBase64.length + sfxBase64Len >
          MAX_VERCEL_AUDIO_BASE64_CHARS
        ) {
          return jsonToolResult(
            {
              error: "Audio combinado demasiado pesado para el límite de payload de Vercel (~3.5 MB).",
            },
            true
          );
        }

        const dims = ASPECT_RATIO_DIMENSIONS[aspectRatio];
        const safeDuration = Math.min(Math.max(Math.round(duration), 1), 120);
        const safeTitle = filename.trim() || "Comercial ZYRVAE";

        const rendererPayload = {
          mode: "html",
          html,
          title: safeTitle,
          duration: safeDuration,
          fps,
          width: dims.width,
          height: dims.height,
          cleanVideo: true,
          accentColor: "#6366f1",
          audioData: resolvedAudioBase64 || null,
          audioExt: audioExt || null,
          musicPresetId: musicPresetId?.trim() || null,
          voiceoverBase64: resolvedVoiceoverBase64 || null,
          voiceoverExt: resolvedVoiceoverExt,
          sfxEvents: resolvedSfxEvents,
          async: true,
        };

        let response: Response | null = null;
        let lastErr = "";

        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            response = await fetch(`${backendUrl}/render`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify(rendererPayload),
              signal: AbortSignal.timeout(15000),
            });

            if ((response.status === 502 || response.status === 503) && attempt === 1) {
              await new Promise((r) => setTimeout(r, 2500));
              continue;
            }
            break;
          } catch (err: unknown) {
            lastErr = err instanceof Error ? err.message : String(err);
            if (attempt === 1) {
              await new Promise((r) => setTimeout(r, 2000));
            }
          }
        }

        if (!response || !response.ok) {
          const details = response ? await response.text().catch(() => "") : lastErr;
          return jsonToolResult(
            {
              error: "No se pudo encolar el render en renderer-service.",
              status: response?.status || 503,
              details: details.slice(0, 400),
            },
            true
          );
        }

        const jobData = (await response.json().catch(() => ({}))) as {
          jobId?: string;
          status?: string;
          queuePosition?: number;
        };

        if (!jobData.jobId) {
          return jsonToolResult(
            {
              error: "renderer-service no devolvió un jobId válido.",
              response: jobData,
            },
            true
          );
        }

        return jsonToolResult({
          jobId: jobData.jobId,
          status: jobData.status || "queued",
          queuePosition: jobData.queuePosition ?? null,
          filename: safeTitle,
          duration: safeDuration,
          fps,
          aspectRatio,
          width: dims.width,
          height: dims.height,
          voiceoverSource,
          voiceoverSizeBytes,
          sfxSource: sfxEvents !== undefined ? "explicit" : "html_meta",
          sfxEvents: resolvedSfxEvents,
          rendererUrl: getPublicRendererUrl(backendUrl),
        });
      }
    );

    server.registerTool(
      "get_render_status",
      {
        title: "Consultar Estado del Render",
        description:
          "Consulta el progreso en tiempo real de un jobId de renderizado y devuelve las URLs de descarga directa cuando finaliza.",
        inputSchema: z.object({
          jobId: z.string().min(1).describe("Identificador jobId devuelto por start_render"),
        }),
      },
      async ({ jobId }) => {
        const backendUrl = getRendererUrl();
        if (!backendUrl) {
          return jsonToolResult({ error: "RENDERER_URL no está configurada." }, true);
        }

        try {
          const statusRes = await fetch(
            `${backendUrl}/render?jobId=${encodeURIComponent(jobId.trim())}`,
            {
              cache: "no-store",
              signal: AbortSignal.timeout(10000),
            }
          );

          const data = (await statusRes.json().catch(() => null)) as Record<
            string,
            unknown
          > | null;

          if (!statusRes.ok || !data) {
            return jsonToolResult(
              {
                jobId,
                status: statusRes.status,
                error:
                  (data && typeof data.error === "string" && data.error) ||
                  "No se pudo consultar el progreso del trabajo.",
              },
              true
            );
          }

          const publicUrl = getPublicRendererUrl(backendUrl);
          const isDone = data.status === "done";
          const encodedJobId = encodeURIComponent(jobId.trim());

          return jsonToolResult({
            jobId,
            status: data.status ?? null,
            frame: data.frame ?? null,
            totalFrames: data.totalFrames ?? null,
            percent: data.percent ?? null,
            queuePosition: data.queuePosition ?? null,
            error: data.error ?? null,
            rendererUrl: publicUrl,
            directDownloadUrl:
              isDone && publicUrl ? `${publicUrl}/render/download/${encodedJobId}` : null,
            downloadUrl: isDone ? `/api/render?jobId=${encodedJobId}&download=1` : null,
          });
        } catch (err: unknown) {
          return jsonToolResult(
            {
              jobId,
              error: "Error consultando estado del render.",
              details: err instanceof Error ? err.message : String(err),
            },
            true
          );
        }
      }
    );
  },
  {
    serverInfo: {
      name: "zyrvae-media-studio",
      version: "1.0.0",
    },
  }
);

async function authorizedHandler(request: Request) {
  if (!isAuthorizedMcpRequest(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Bearer realm="zyrvae-mcp"',
        },
      }
    );
  }

  return mcpHandler(request);
}

export { authorizedHandler as GET, authorizedHandler as POST, authorizedHandler as DELETE };
