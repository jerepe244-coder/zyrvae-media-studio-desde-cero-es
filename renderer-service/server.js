import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import crypto from "node:crypto";
import { renderHtmlToMp4, warmUpBrowser } from "./engine.js";
import { generateCommercialHtml } from "./templates/commercial.js";
import { resolveMusicPresetPath, resolveSfxPresetPath } from "./audio-presets.js";

const app = express();
const PORT = process.env.PORT || 8080;
const MAX_CONCURRENT_RENDERS = Math.min(
  Math.max(parseInt(process.env.MAX_CONCURRENT_RENDERS || "1", 10) || 1, 1),
  2
);

// Cola FIFO con concurrencia máxima acotada (1 por defecto, máximo 2) para evitar OOM o saturación de CPU
let activeRenderCount = 0;
const waitingRenderQueue = [];

function getQueuePosition(jobId) {
  const idx = waitingRenderQueue.findIndex((item) => item.jobId === jobId);
  return idx >= 0 ? idx + 1 : 0;
}

function drainRenderQueue() {
  while (activeRenderCount < MAX_CONCURRENT_RENDERS && waitingRenderQueue.length > 0) {
    const nextItem = waitingRenderQueue.shift();
    if (!nextItem) break;

    activeRenderCount += 1;
    Promise.resolve()
      .then(() => nextItem.taskFn())
      .then(nextItem.resolve, nextItem.reject)
      .finally(() => {
        activeRenderCount = Math.max(0, activeRenderCount - 1);
        drainRenderQueue();
      });
  }
}

function enqueueRender(jobId, taskFn) {
  return new Promise((resolve, reject) => {
    waitingRenderQueue.push({ jobId, taskFn, resolve, reject });
    drainRenderQueue();
  });
}

// Almacén en memoria de trabajos asíncronos (jobId -> estado/progreso/ruta MP4)
const renderJobs = new Map();
const JOB_TTL_MS = 20 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [jobId, job] of renderJobs.entries()) {
    if ((job.status === "done" || job.status === "error") && now - job.updatedAt > JOB_TTL_MS) {
      if (job.outputPath && fs.existsSync(job.outputPath)) {
        fs.unlink(job.outputPath, () => {});
      }
      renderJobs.delete(jobId);
    }
  }
}, 5 * 60 * 1000).unref();

const DEFAULT_ALLOWED_ORIGINS = new Set([
  "https://zyrvae-media-studio.vercel.app",
  "https://zyrvae-media-studio-desde-cero-es-omega.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);
const EXTRA_ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
for (const origin of EXTRA_ALLOWED_ORIGINS) {
  DEFAULT_ALLOWED_ORIGINS.add(origin);
}

function isAllowedCorsOrigin(origin) {
  if (!origin) return true;
  if (DEFAULT_ALLOWED_ORIGINS.has(origin)) return true;
  return /^https:\/\/zyrvae-media-studio(-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);
}

app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedCorsOrigin(origin));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: [
      "Content-Disposition",
      "Content-Length",
      "X-Render-Time-Seconds",
      "X-Engine",
      "X-Title",
      "X-Job-Id",
    ],
  })
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

function sanitizeJobResponse(job) {
  const queuePosition = job.status === "queued" ? getQueuePosition(job.jobId) : 0;
  return {
    jobId: job.jobId,
    status: job.status,
    phase: job.phase,
    queuePosition,
    maxConcurrency: MAX_CONCURRENT_RENDERS,
    frame: job.frame,
    totalFrames: job.totalFrames,
    percent: job.percent,
    currentTimeSeconds: job.currentTimeSeconds,
    title: job.title,
    fileName: job.fileName,
    duration: job.duration,
    fps: job.fps,
    width: job.width,
    height: job.height,
    sizeBytes: job.sizeBytes,
    renderTimeSeconds: job.renderTimeSeconds,
    downloadUrl: job.status === "done" ? `/render/download/${job.jobId}` : null,
    error: job.error,
  };
}

function writeOptionalAudioFile(audioData, audioExt, jobId, kind = "audio") {
  if (!audioData || typeof audioData !== "string") return null;
  const cleanedBase64 = audioData.replace(/^data:[^;]+;base64,/, "").trim();
  if (!cleanedBase64) return null;

  const ext = String(audioExt || "mp3").toLowerCase().replace(/[^a-z0-9]/g, "") === "wav" ? "wav" : "mp3";
  const safeKind = kind === "voiceover" ? "voiceover" : "audio";
  const audioPath = path.join(os.tmpdir(), `zyrvae_${safeKind}_${jobId}.${ext}`);
  fs.writeFileSync(audioPath, Buffer.from(cleanedBase64, "base64"));
  return audioPath;
}

function streamMp4File(res, job) {
  if (!job || job.status !== "done" || !job.outputPath || !fs.existsSync(job.outputPath)) {
    return res.status(404).json({
      error: "Archivo no disponible",
      message: "El video aún no está listo o expiró en el servidor.",
    });
  }

  const fileStat = fs.statSync(job.outputPath);
  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Content-Length", fileStat.size);
  res.setHeader("Content-Disposition", `attachment; filename="${job.fileName}"`);
  res.setHeader("X-Engine", "Dedicated-Render-Cloud-v3");
  res.setHeader("X-Job-Id", job.jobId);
  if (job.renderTimeSeconds) {
    res.setHeader("X-Render-Time-Seconds", String(job.renderTimeSeconds));
  }

  const stream = fs.createReadStream(job.outputPath);
  stream.on("error", (err) => {
    console.error(`[Download Error] Job ${job.jobId}:`, err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Error al transmitir el video MP4." });
    }
  });
  stream.pipe(res);
}

app.get("/health", (req, res) => {
  warmUpBrowser();
  res.json({
    status: "ok",
    service: "ZYRVAE Media Studio Video Renderer",
    version: "3.0.0",
    engine: "Puppeteer WAAPI Deterministic + FFmpeg H.264 Streaming",
    activeJobs: renderJobs.size,
    activeRenders: activeRenderCount,
    queuedRenders: waitingRenderQueue.length,
    maxConcurrency: MAX_CONCURRENT_RENDERS,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  warmUpBrowser();
  res.json({
    message: "ZYRVAE Media Studio - Motor de Renderizado HTML a MP4 Asíncrono (v3.0)",
    endpoints: {
      health: "GET /health",
      renderAsync: "POST /render",
      status: "GET /render?jobId=<id>",
      download: "GET /render/download/<id>",
    },
  });
});

// Consultar estado o descargar por query param (?jobId=...)
app.get("/render", (req, res) => {
  const jobId = typeof req.query.jobId === "string" ? req.query.jobId.trim() : "";
  if (!jobId) {
    return res.json({
      status: "ready",
      version: "3.0.0",
      activeJobs: renderJobs.size,
    });
  }

  const job = renderJobs.get(jobId);
  if (!job) {
    return res.status(404).json({
      error: "Trabajo no encontrado",
      jobId,
    });
  }

  const wantsDownload = req.query.download === "1" || req.query.download === "true";
  if (wantsDownload) {
    return streamMp4File(res, job);
  }

  return res.json(sanitizeJobResponse(job));
});

app.get("/render/status/:jobId", (req, res) => {
  const job = renderJobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: "Trabajo no encontrado", jobId: req.params.jobId });
  }
  return res.json(sanitizeJobResponse(job));
});

app.get("/render/download/:jobId", (req, res) => {
  const job = renderJobs.get(req.params.jobId);
  return streamMp4File(res, job);
});

// Endpoint principal de Renderizado HTML a MP4 (asíncrono con jobId por defecto)
app.post("/render", async (req, res) => {
  try {
    const {
      html,
      html_code,
      title = "Comercial ZYRVAE",
      duration = 15,
      fps = 30,
      width = 1080,
      height = 1920,
      cleanVideo = true,
      mode,
      props,
      accentColor,
      audioData,
      audioBase64,
      audioExt,
      musicPresetId,
      voiceoverBase64,
      voiceoverData,
      voiceoverExt,
      sfxEvents,
      async: asyncFlag,
    } = req.body || {};

    const safeDuration = Math.min(Math.max(Number(duration) || 15, 1), 120);
    const safeFps = Math.min(Math.max(Math.round(Number(fps) || 30), 1), 60);
    const safeWidth = Math.min(Math.max(Math.round(Number(width) || 1080), 200), 3840);
    const safeHeight = Math.min(Math.max(Math.round(Number(height) || 1920), 200), 3840);
    const totalFrames = Math.max(1, Math.round(safeDuration * safeFps));

    let rawHtml = String(html || html_code || "").trim();

    if (!rawHtml && (props || mode === "remotion" || mode === "commercial" || title)) {
      const mergedProps = {
        title: title || props?.title || "Comercial ZYRVAE",
        subtitle: props?.subtitle || "Imprenta de Video Automatizada",
        description:
          props?.description ||
          "Diseño premium de alta conversión para anuncios 9:16 Ultra HD.",
        brandName: props?.brandName || "ZYRVAE MEDIA STUDIO",
        accentColor: accentColor || props?.accentColor || "#6366f1",
        badgeText: props?.badgeText || "Comercial ZYRVAE",
        statsValue: props?.statsValue || "+300%",
        statsLabel: props?.statsLabel || "Conversión de Marca",
        callToAction: props?.callToAction || "Potencia tu Negocio Hoy",
        duration: safeDuration,
      };
      rawHtml = generateCommercialHtml(mergedProps);
    }

    if (!rawHtml) {
      return res.status(400).json({
        error: "Faltan parámetros",
        message: "Debes enviar el código HTML en 'html'.",
      });
    }

    const safeTitle =
      String(title)
        .replace(/[^a-zA-Z0-9_\-\s]/g, "")
        .trim()
        .replace(/\s+/g, "_") || "Comercial_ZYRVAE";

    const jobId = crypto.randomUUID();
    const outputPath = path.join(os.tmpdir(), `zyrvae_${jobId}.mp4`);
    let audioPath = null;
    let voiceoverPath = null;
    const sfxItems = [];
    const tempAudioFiles = [];

    const cleanupTempAudioFiles = () => {
      for (const tempPath of tempAudioFiles) {
        if (tempPath && fs.existsSync(tempPath)) {
          fs.unlink(tempPath, () => {});
        }
      }
    };

    try {
      const uploadedMusicPath = writeOptionalAudioFile(
        audioBase64 || audioData,
        audioExt,
        jobId,
        "audio"
      );
      if (uploadedMusicPath) {
        audioPath = uploadedMusicPath;
        tempAudioFiles.push(uploadedMusicPath);
      } else if (musicPresetId) {
        const presetMusicPath = resolveMusicPresetPath(musicPresetId);
        if (presetMusicPath) {
          audioPath = presetMusicPath;
        } else {
          console.warn(`[Job ${jobId}] Preset de música no disponible en disco: ${musicPresetId}`);
        }
      }

      voiceoverPath = writeOptionalAudioFile(
        voiceoverBase64 || voiceoverData,
        voiceoverExt || "mp3",
        jobId,
        "voiceover"
      );
      if (voiceoverPath) {
        tempAudioFiles.push(voiceoverPath);
      }

      if (Array.isArray(sfxEvents)) {
        sfxEvents.slice(0, 24).forEach((ev, idx) => {
          if (!ev || typeof ev !== "object") return;
          const timeSec = Number(ev.timeSec);
          if (!Number.isFinite(timeSec) || timeSec < 0 || timeSec >= safeDuration) return;

          const volume = Math.min(1.5, Math.max(0.05, Number(ev.volume) || 0.85));
          if (ev.customBase64 && typeof ev.customBase64 === "string") {
            const sfxTempPath = writeOptionalAudioFile(
              ev.customBase64,
              ev.ext || "mp3",
              `${jobId}_sfx_${idx}`,
              "audio"
            );
            if (sfxTempPath) {
              tempAudioFiles.push(sfxTempPath);
              sfxItems.push({ path: sfxTempPath, timeSec, volume });
            }
          } else if (ev.id) {
            const presetSfxPath = resolveSfxPresetPath(ev.id);
            if (presetSfxPath) {
              sfxItems.push({ path: presetSfxPath, timeSec, volume });
            } else {
              console.warn(`[Job ${jobId}] SFX no disponible en disco: ${ev.id}`);
            }
          }
        });
      }
    } catch (audioErr) {
      cleanupTempAudioFiles();
      return res.status(400).json({
        error: "Audio inválido",
        message: audioErr instanceof Error ? audioErr.message : "No se pudo procesar el archivo de audio.",
      });
    }

    const job = {
      jobId,
      status: "queued",
      phase: "queued",
      frame: 0,
      totalFrames,
      percent: 0,
      currentTimeSeconds: "0.0",
      title: safeTitle,
      fileName: `${safeTitle}.mp4`,
      duration: safeDuration,
      fps: safeFps,
      width: safeWidth,
      height: safeHeight,
      outputPath,
      sizeBytes: 0,
      renderTimeSeconds: null,
      error: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    renderJobs.set(jobId, job);

    const runJob = async () => {
      const startTime = Date.now();
      try {
        job.status = "capturing";
        job.phase = "capturing";
        job.updatedAt = Date.now();

        await renderHtmlToMp4({
          html: rawHtml,
          duration: safeDuration,
          fps: safeFps,
          width: safeWidth,
          height: safeHeight,
          cleanVideo: cleanVideo !== false,
          audioPath,
          voiceoverPath,
          sfxItems,
          outputPath,
          onProgress: (p) => {
            job.status = p.phase === "encoding" ? "encoding" : p.phase === "done" ? "done" : "capturing";
            job.phase = p.phase;
            job.frame = p.frame;
            job.totalFrames = p.totalFrames;
            job.percent = p.percent;
            job.currentTimeSeconds = p.currentTimeSeconds;
            job.updatedAt = Date.now();
          },
        });

        if (!fs.existsSync(outputPath)) {
          throw new Error("El archivo de video no se generó correctamente en el servidor.");
        }

        const stat = fs.statSync(outputPath);
        job.sizeBytes = stat.size;
        job.renderTimeSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
        job.status = "done";
        job.phase = "done";
        job.frame = totalFrames;
        job.percent = 100;
        job.updatedAt = Date.now();

        console.log(
          `[Job ${jobId}] Completado: ${job.fileName} (${(stat.size / (1024 * 1024)).toFixed(2)} MB) en ${job.renderTimeSeconds}s`
        );
      } catch (err) {
        console.error(`[Job ${jobId}] Error:`, err);
        job.status = "error";
        job.phase = "error";
        job.error = err instanceof Error ? err.message : String(err);
        job.updatedAt = Date.now();
        if (fs.existsSync(outputPath)) {
          fs.unlink(outputPath, () => {});
        }
      } finally {
        cleanupTempAudioFiles();
      }
    };

    const isAsync = asyncFlag !== false && req.query.async !== "false";

    if (isAsync) {
      // Encolar trabajo respetando concurrencia máxima y responder inmediatamente con jobId (cero timeouts HTTP)
      enqueueRender(jobId, runJob).catch(() => {});
      return res.status(202).json(sanitizeJobResponse(job));
    }

    // Modo síncrono legado si un cliente explícitamente pasa async: false
    await enqueueRender(jobId, runJob);
    if (job.status === "error") {
      return res.status(500).json({
        error: "Error durante el renderizado del video",
        details: job.error,
      });
    }
    return streamMp4File(res, job);
  } catch (error) {
    console.error("[Render Error]:", error);
    return res.status(500).json({
      error: "Error durante la solicitud de renderizado",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`=======================================================`);
  console.log(`🚀 ZYRVAE Video Renderer Service v3.0 activo en puerto ${PORT}`);
  console.log(`📡 URL Health: http://localhost:${PORT}/health`);
  console.log(`🎬 URL Render Async: POST http://localhost:${PORT}/render`);
  console.log(`=======================================================`);
  warmUpBrowser();
});
