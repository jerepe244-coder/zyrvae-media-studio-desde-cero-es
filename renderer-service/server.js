import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import crypto from "node:crypto";
import { renderHtmlToMp4, warmUpBrowser } from "./engine.js";
import { generateCommercialHtml } from "./templates/commercial.js";

const app = express();
const PORT = process.env.PORT || 8080;

// Cola secuencial para evitar que múltiples peticiones simultáneas saturen los 512MB de RAM
let renderQueue = Promise.resolve();
function runExclusiveRender(taskFn) {
  const next = renderQueue.then(taskFn, taskFn);
  renderQueue = next.catch(() => {});
  return next;
}

// Middleware de CORS abierto con cabeceras expuestas para llamadas directas desde el navegador
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Content-Disposition", "X-Render-Time-Seconds", "X-Engine", "X-Title"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Endpoint de comprobación de salud y precalentamiento del navegador
app.get("/health", (req, res) => {
  warmUpBrowser();
  res.json({
    status: "ok",
    service: "ZYRVAE Media Studio Video Renderer",
    version: "2.0.0",
    engine: "Puppeteer Warm Headless + FFmpeg UltraFast",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (req, res) => {
  warmUpBrowser();
  res.json({
    message: "ZYRVAE Media Studio - Motor de Renderizado HTML a MP4 Activo (v2.0)",
    endpoints: {
      health: "GET /health",
      render: "POST /render",
    },
  });
});

// Endpoint principal de Renderizado HTML a MP4
app.post("/render", async (req, res) => {
  const startTime = Date.now();
  let tempFilePath = null;

  try {
    const {
      html,
      html_code,
      title = "Comercial ZYRVAE",
      duration = 15,
      fps = 24,
      width = 1080,
      height = 1920,
      download = true,
      mode,
      props,
      accentColor,
    } = req.body || {};

    const safeDuration = Math.min(Math.max(Number(duration) || 15, 1), 120);
    const safeFps = Math.min(Math.max(Number(fps) || 24, 10), 60);
    const safeWidth = Math.min(Math.max(Number(width) || 1080, 200), 3840);
    const safeHeight = Math.min(Math.max(Number(height) || 1920, 200), 3840);

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

    const uniqueId = crypto.randomUUID();
    const tempDir = os.tmpdir();
    tempFilePath = path.join(tempDir, `zyrvae_${uniqueId}.mp4`);

    console.log(
      `[Render Request] ID: ${uniqueId} | Título: ${safeTitle} | Duración: ${safeDuration}s`
    );

    await runExclusiveRender(() =>
      renderHtmlToMp4({
        html: rawHtml,
        duration: safeDuration,
        fps: safeFps,
        width: safeWidth,
        height: safeHeight,
        outputPath: tempFilePath,
        onProgress: (p) => {
          console.log(
            `[ID ${uniqueId}] Progreso: ${p.percent}% (${p.frame}/${p.totalFrames} frames)`
          );
        },
      })
    );

    if (!fs.existsSync(tempFilePath)) {
      throw new Error("El archivo de video no se generó correctamente en el servidor.");
    }

    const fileStat = fs.statSync(tempFilePath);
    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `[Render Completado] Tamaño: ${(fileStat.size / (1024 * 1024)).toFixed(2)} MB en ${elapsedSeconds}s`
    );

    const fileName = `${safeTitle}.mp4`;

    if (download) {
      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Length", fileStat.size);
      res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
      res.setHeader("X-Render-Time-Seconds", elapsedSeconds);
      res.setHeader("X-Engine", "Dedicated-Render-Cloud-v2");

      const fileStream = fs.createReadStream(tempFilePath);
      fileStream.pipe(res);

      fileStream.on("end", () => {
        fs.unlink(tempFilePath, () => {});
      });

      fileStream.on("error", (err) => {
        console.error("Error al transmitir archivo de video:", err);
        fs.unlink(tempFilePath, () => {});
      });
    } else {
      const base64Data = fs.readFileSync(tempFilePath, { encoding: "base64" });
      fs.unlink(tempFilePath, () => {});

      return res.json({
        success: true,
        title: safeTitle,
        duration: safeDuration,
        fps: safeFps,
        sizeBytes: fileStat.size,
        renderTimeSeconds: elapsedSeconds,
        videoBase64: `data:video/mp4;base64,${base64Data}`,
      });
    }
  } catch (error) {
    console.error("[Render Error]:", error);
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlink(tempFilePath, () => {});
    }

    return res.status(500).json({
      error: "Error durante el renderizado del video",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`=======================================================`);
  console.log(`🚀 ZYRVAE Video Renderer Service v2.0 activo en puerto ${PORT}`);
  console.log(`📡 URL Health: http://localhost:${PORT}/health`);
  console.log(`🎬 URL Render: http://localhost:${PORT}/render`);
  console.log(`=======================================================`);
  warmUpBrowser();
});
