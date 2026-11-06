import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import puppeteer from "puppeteer";
import ffmpegStatic from "ffmpeg-static";

// Obtener ruta del binario FFmpeg (usar variable de entorno o binario estático)
const FFMPEG_PATH = process.env.FFMPEG_PATH || ffmpegStatic || "ffmpeg";

// Script de reloj virtual para control determinista frame por frame
const VIRTUAL_CLOCK_SCRIPT = `
(function() {
  if (window.__virtualClockInitialized) return;
  window.__virtualClockInitialized = true;
  window.__virtualTime = 0;
  
  var origPerfNow = window.performance ? window.performance.now.bind(window.performance) : null;
  if (origPerfNow) {
    try { window.performance.now = function() { return window.__virtualTime; }; } catch (e) {}
  }
  
  var origDateNow = Date.now.bind(Date);
  var startTime = origDateNow();
  try { Date.now = function() { return startTime + window.__virtualTime; }; } catch (e) {}

  var rafCallbacks = new Set();
  window.__rafCallbacks = rafCallbacks;
  window.requestAnimationFrame = function(cb) {
    var id = Math.random();
    rafCallbacks.add({ id: id, cb: cb });
    return id;
  };
  window.cancelAnimationFrame = function(id) {
    rafCallbacks.forEach(function(item) {
      if (item.id === id) { rafCallbacks.delete(item); }
    });
  };

  window.__stepVirtualTime = function(newTimeMs) {
    window.__virtualTime = newTimeMs;
    var toRun = Array.from(rafCallbacks);
    rafCallbacks.clear();
    for (var i = 0; i < toRun.length; i++) {
      try { toRun[i].cb(newTimeMs); } catch (e) { console.error(e); }
    }
    if (document.getAnimations) {
      try {
        var animations = document.getAnimations({ subtree: true });
        for (var j = 0; j < animations.length; j++) {
          try {
            animations[j].pause();
            animations[j].currentTime = newTimeMs;
          } catch (err) {}
        }
      } catch (e) {}
    }
    if (typeof window.__seekToTime === "function") {
      try { window.__seekToTime(newTimeMs); } catch (e) {}
    }
  };
})();
`;

/**
 * Prepara el código HTML para que tenga la estructura adecuada de resolución y estilos base.
 */
export function sanitizeHtml(rawHtml, width = 1080, height = 1920) {
  let html = (rawHtml || "").trim();

  if (!html.toLowerCase().includes("<html") && !html.toLowerCase().includes("<!doctype")) {
    html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${width}, height=${height}">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: ${width}px;
      height: ${height}px;
      overflow: hidden;
      background: #09090b;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
  </style>
  <script>${VIRTUAL_CLOCK_SCRIPT}</script>
</head>
<body>
  ${html}
</body>
</html>`;
  } else {
    // Inyectar el script del reloj virtual en el head
    if (html.toLowerCase().includes("<head")) {
      html = html.replace(/<head([^>]*)>/i, `<head$1>\n  <script>${VIRTUAL_CLOCK_SCRIPT}</script>`);
    } else {
      html = `<script>${VIRTUAL_CLOCK_SCRIPT}</script>\n` + html;
    }

    // Si ya tiene head pero no charset UTF-8
    if (!html.toLowerCase().includes("charset")) {
      html = html.replace(/<head([^>]*)>/i, '<head$1>\n  <meta charset="UTF-8">');
    }
    // Asegurar que el body tenga el tamaño correcto si no lo tiene
    if (!html.includes(`width: ${width}px`)) {
      html = html.replace(
        /<head([^>]*)>/i,
        `<head$1>\n  <style>html, body { width: ${width}px; height: ${height}px; margin: 0; overflow: hidden; }</style>`
      );
    }
  }

  return html;
}

/**
 * Motor de renderizado: Carga el HTML en Chromium Headless vía Puppeteer,
 * avanza la línea de tiempo frame por frame de forma determinista y canaliza los fotogramas
 * directamente a FFmpeg por tubería stdin para generar un archivo MP4 estándar H.264.
 */
export async function renderHtmlToMp4({
  html,
  duration = 10,
  fps = 30,
  width = 1080,
  height = 1920,
  outputPath,
  onProgress,
}) {
  const totalFrames = Math.max(1, Math.round(duration * fps));
  const frameIntervalMs = 1000 / fps;
  const finalHtml = sanitizeHtml(html, width, height);

  console.log(`[Renderer] Iniciando renderizado: ${width}x${height} @ ${fps}fps, duración: ${duration}s (${totalFrames} fotogramas)`);
  console.log(`[Renderer] FFmpeg binary: ${FFMPEG_PATH}`);

  // 1. Lanzar Puppeteer optimizado para servidores con recursos limitados (Render.com 512MB RAM, Railway)
  const browser = await puppeteer.launch({
    headless: "shell",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--no-first-run",
      "--no-zygote",
      "--disable-extensions",
      "--mute-audio",
      "--js-flags=--max-old-space-size=192",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-breakpad",
      "--disable-client-side-phishing-detection",
      "--disable-default-apps",
      "--disable-features=Translate,BackForwardCache,AcceptCHFrame,MediaRouter,OptimizationHints",
      "--disable-ipc-flooding-protection",
      "--disable-renderer-backgrounding",
      `--window-size=${width},${height}`,
    ],
    defaultViewport: {
      width,
      height,
      deviceScaleFactor: 1,
    },
  });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(10000);
    page.setDefaultTimeout(10000);
    await page.setViewport({ width, height, deviceScaleFactor: 1 });

    // Inyectar controlador de tiempo virtual antes de cargar cualquier script
    await page.evaluateOnNewDocument(() => {
      let virtualTime = 0;
      window.__virtualTime = 0;

      // Mock de performance.now y Date.now
      const origPerfNow = window.performance.now.bind(window.performance);
      window.performance.now = () => window.__virtualTime;
      
      const origDateNow = Date.now.bind(Date);
      const startTime = origDateNow();
      Date.now = () => startTime + window.__virtualTime;

      // Soporte para callbacks en requestAnimationFrame
      const rafCallbacks = new Set();
      window.__rafCallbacks = rafCallbacks;
      
      window.requestAnimationFrame = (cb) => {
        const id = Math.random();
        rafCallbacks.add({ id, cb });
        return id;
      };

      window.cancelAnimationFrame = (id) => {
        for (const item of rafCallbacks) {
          if (item.id === id) {
            rafCallbacks.delete(item);
            break;
          }
        }
      };

      window.__stepVirtualTime = (newTimeMs) => {
        window.__virtualTime = newTimeMs;
        
        // Ejecutar callbacks de rAF pendientes
        const toRun = Array.from(rafCallbacks);
        rafCallbacks.clear();
        for (const item of toRun) {
          try {
            item.cb(newTimeMs);
          } catch (e) {
            console.error("Error en rAF callback:", e);
          }
        }

        // Controlar animaciones nativas CSS / Web Animations API
        if (document.getAnimations) {
          const animations = document.getAnimations({ subtree: true });
          for (const anim of animations) {
            try {
              anim.pause();
              anim.currentTime = newTimeMs;
            } catch {}
          }
        }

        // Si la animación tiene hook personalizado de seek
        if (typeof window.__seekToTime === "function") {
          try {
            window.__seekToTime(newTimeMs);
          } catch {}
        }
      };
    });

    // Cargar contenido HTML sin bloquearse por peticiones de red externas
    try {
      await page.setContent(finalHtml, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });
    } catch (err) {
      console.warn("[Renderer] Aviso no bloqueante en setContent:", err.message);
    }

    // Asegurar ejecución del reloj virtual si setContent no ejecutó scripts inline
    await page.evaluate(VIRTUAL_CLOCK_SCRIPT).catch(() => {});

    // Esperar fuentes con límite de 1 segundo para no congelar el proceso
    try {
      await Promise.race([
        page.evaluate(() => document.fonts?.ready),
        new Promise((r) => setTimeout(r, 1000)),
      ]);
    } catch {}

    // Pequeña espera para estabilización de estilos
    await new Promise((r) => setTimeout(r, 150));

    // 2. Iniciar proceso FFmpeg recibiendo imágenes por pipe (stdin)
    const ffmpegArgs = [
      "-y",
      "-f", "image2pipe",
      "-vcodec", "mjpeg",
      "-r", String(fps),
      "-i", "-",
      "-c:v", "libx264",
      "-preset", "ultrafast",
      "-crf", "24",
      "-pix_fmt", "yuv420p",
      "-movflags", "+faststart",
      outputPath,
    ];

    const ffmpegProcess = spawn(FFMPEG_PATH, ffmpegArgs);
    ffmpegProcess.stdin.on("error", (err) => {
      console.warn("[FFmpeg stdin error]:", err.message);
    });

    let ffmpegErrorLog = "";
    ffmpegProcess.stderr.on("data", (chunk) => {
      ffmpegErrorLog += chunk.toString();
    });

    const ffmpegPromise = new Promise((resolve, reject) => {
      ffmpegProcess.on("close", (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          reject(new Error(`FFmpeg finalizó con código de error ${code}: ${ffmpegErrorLog.slice(-500)}`));
        }
      });
      ffmpegProcess.on("error", (err) => {
        reject(new Error(`Fallo al ejecutar FFmpeg: ${err.message}`));
      });
    });

    // 3. Capturar fotograma a fotograma y escribirlos en FFmpeg stdin
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      const currentMs = frameIndex * frameIntervalMs;

      // Avanzar el reloj virtual
      await page.evaluate((timeMs) => {
        if (typeof window.__stepVirtualTime === "function") {
          window.__stepVirtualTime(timeMs);
        } else if (document.getAnimations) {
          const animations = document.getAnimations({ subtree: true });
          for (const anim of animations) {
            try {
              anim.pause();
              anim.currentTime = timeMs;
            } catch {}
          }
        }
      }, currentMs);

      // Tomar captura JPEG en buffer (ultra-rápido y bajo consumo de memoria)
      const screenshotBuffer = await page.screenshot({
        type: "jpeg",
        quality: 80,
        optimizeForSpeed: true,
      });

      // Escribir en stdin de FFmpeg con control de contrapresión (backpressure)
      if (!ffmpegProcess.stdin.write(screenshotBuffer)) {
        await new Promise((resolve) => ffmpegProcess.stdin.once("drain", resolve));
      }

      if (onProgress && (frameIndex % 15 === 0 || frameIndex === totalFrames - 1)) {
        const percent = Math.round(((frameIndex + 1) / totalFrames) * 100);
        onProgress({
          frame: frameIndex + 1,
          totalFrames,
          percent,
          currentTimeSeconds: (currentMs / 1000).toFixed(1),
        });
      }
    }

    // Finalizar flujo stdin hacia FFmpeg
    ffmpegProcess.stdin.end();

    // Esperar a que FFmpeg termine de empaquetar el MP4
    await ffmpegPromise;

    console.log(`[Renderer] ¡Video generado con éxito!: ${outputPath}`);
    return {
      success: true,
      outputPath,
      duration,
      fps,
      totalFrames,
    };
  } finally {
    await browser.close().catch(() => {});
  }
}
