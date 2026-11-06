import { spawn } from "node:child_process";
import fs from "node:fs";
import puppeteer from "puppeteer";
import ffmpegStatic from "ffmpeg-static";

function resolveFfmpegPath() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }
  if (ffmpegStatic && fs.existsSync(ffmpegStatic)) {
    return ffmpegStatic;
  }
  if (fs.existsSync("/usr/bin/ffmpeg")) {
    return "/usr/bin/ffmpeg";
  }
  return "ffmpeg";
}

function resolveChromiumPath() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

const FFMPEG_PATH = resolveFfmpegPath();

// Script único de reloj virtual determinista y auto-activación de reproducción para animaciones y video
const VIRTUAL_CLOCK_SCRIPT = `
(function() {
  if (window.__virtualClockInitialized) return;
  window.__virtualClockInitialized = true;
  window.__virtualTime = 0;

  var origPerfNow = window.performance ? window.performance.now.bind(window.performance) : null;
  if (origPerfNow) {
    try {
      window.performance.now = function() { return window.__virtualTime; };
    } catch (e) {}
  }

  var origDateNow = Date.now.bind(Date);
  var startTime = origDateNow();
  try {
    Date.now = function() { return startTime + window.__virtualTime; };
  } catch (e) {}

  var rafCallbacks = new Map();
  var rafIdCounter = 1;
  window.requestAnimationFrame = function(cb) {
    var id = rafIdCounter++;
    rafCallbacks.set(id, cb);
    return id;
  };
  window.cancelAnimationFrame = function(id) {
    rafCallbacks.delete(id);
  };

  // Función de disparo automático para iniciar cualquier video o animación interactiva
  window.__triggerAutoPlay = function() {
    try {
      // 1. Desmutear y activar reproducción de todas las etiquetas <video> y <audio>
      var medias = document.querySelectorAll('video, audio');
      for (var m = 0; m < medias.length; m++) {
        var media = medias[m];
        media.muted = true;
        media.setAttribute('muted', '');
        media.setAttribute('playsinline', '');
        media.setAttribute('autoplay', '');
        if (typeof media.play === 'function') {
          media.play().catch(function() {});
        }
      }

      // 2. Simular clic automático en botones de Play / Iniciar / Reproducir
      var playButtons = document.querySelectorAll(
        'button, [role="button"], .play, #play, .play-btn, .btn-play, [aria-label*="play" i], [aria-label*="reproducir" i]'
      );
      for (var b = 0; b < playButtons.length; b++) {
        try {
          playButtons[b].click();
        } catch (e) {}
      }

      // 3. Disparar eventos globales para componentes reactivos
      window.dispatchEvent(new Event('play'));
      window.dispatchEvent(new CustomEvent('video-start'));
      document.dispatchEvent(new Event('play'));
    } catch (err) {}
  };

  // Stepper determinista fotograma a fotograma
  window.__stepVirtualTime = function(newTimeMs) {
    window.__virtualTime = newTimeMs;

    // Ejecutar callbacks de requestAnimationFrame registrados
    var pending = Array.from(rafCallbacks.entries());
    rafCallbacks.clear();
    for (var i = 0; i < pending.length; i++) {
      try {
        pending[i][1](newTimeMs);
      } catch (e) {}
    }

    // Avanzar Web Animations API (CSS Animations / WAAPI)
    if (document.getAnimations) {
      try {
        var animations = document.getAnimations({ subtree: true });
        for (var j = 0; j < animations.length; j++) {
          var anim = animations[j];
          try {
            anim.pause();
            anim.currentTime = newTimeMs;
          } catch (err) {}
        }
      } catch (e) {}
    }

    // Sincronizar fotogramas de cualquier etiqueta <video> en el documento
    var videos = document.querySelectorAll('video');
    for (var k = 0; k < videos.length; k++) {
      var v = videos[k];
      try {
        v.muted = true;
        v.pause();
        var targetSec = newTimeMs / 1000;
        if (v.duration && !isNaN(v.duration) && v.duration > 0) {
          v.currentTime = targetSec % v.duration;
        } else {
          v.currentTime = targetSec;
        }
      } catch (e) {}
    }

    // Actualizar variables CSS personalizadas
    if (document.documentElement) {
      try {
        document.documentElement.style.setProperty('--virtual-time', newTimeMs + 'ms');
        document.documentElement.style.setProperty('--virtual-seconds', (newTimeMs / 1000) + 's');
      } catch (e) {}
    }

    // Hook personalizado si el script define __seekToTime
    if (typeof window.__seekToTime === "function") {
      try {
        window.__seekToTime(newTimeMs);
      } catch (e) {}
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.__triggerAutoPlay);
  } else {
    window.__triggerAutoPlay();
  }
  window.addEventListener('load', window.__triggerAutoPlay);
})();
`;

/**
 * Prepara y normaliza cualquier código HTML pegado por el usuario para garantizar
 * resolución exacta sin desbordes, con modo de video limpio para publicación.
 */
export function sanitizeHtml(rawHtml, width = 1080, height = 1920, cleanVideo = true) {
  let html = String(rawHtml || "").trim();

  const cleanVideoRules = cleanVideo
    ? `
    /* Ocultar paneles laterales, controles de reproducción o botones de editor para video limpio */
    .panel, #panel, .controls, #controls, .toolbar, #toolbar, .sidebar, #sidebar,
    .player-controls, .video-controls, .control-bar, .playback-bar,
    .vjs-control-bar, .plyr__controls, .jw-controls,
    button[class*="play"], button[id*="play"], [aria-label*="play" i], [aria-label*="reproducir" i],
    .play-btn, .play-button, .btn-play, #play-button, #playBtn, .btn-reproducir,
    .timeline, #timeline {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
    }

    /* Asegurar que el elemento de video, canvas o contenedor principal llene el encuadre */
    video, canvas, .video, #video, .video-container, .player, #player, .composition, .canvas, #canvas, .main-stage {
      max-width: 100% !important;
      max-height: 100% !important;
      width: 100% !important;
      height: 100% !important;
      object-fit: contain !important;
      margin: 0 auto !important;
    }
    `
    : "";

  const baseResetStyle = `<style id="__zyrvae_base_reset">
    html, body {
      width: ${width}px !important;
      height: ${height}px !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      box-sizing: border-box;
      background: #09090b !important;
    }
    ${cleanVideoRules}
  </style>`;

  const hasHtmlTag = /<html[\s>]/i.test(html) || /<!doctype/i.test(html);

  if (!hasHtmlTag) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${width}, height=${height}">
  ${baseResetStyle}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
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
  }

  if (/<head[\s>]/i.test(html)) {
    html = html.replace(/<head([^>]*)>/i, (_, attrs) => {
      return `<head${attrs}>\n  <meta charset="UTF-8">\n  ${baseResetStyle}\n  <script>${VIRTUAL_CLOCK_SCRIPT}</script>`;
    });
  } else if (/<html([^>]*)>/i.test(html)) {
    html = html.replace(/<html([^>]*)>/i, (_, attrs) => {
      return `<html${attrs}>\n<head>\n  <meta charset="UTF-8">\n  ${baseResetStyle}\n  <script>${VIRTUAL_CLOCK_SCRIPT}</script>\n</head>`;
    });
  } else {
    html = `${baseResetStyle}\n<script>${VIRTUAL_CLOCK_SCRIPT}</script>\n${html}`;
  }

  return html;
}

// Instancia persistente (warm browser) para evitar el costo de arranque en frío en cada render
let sharedBrowser = null;
let browserLaunchPromise = null;

export async function getSharedBrowser() {
  if (sharedBrowser && sharedBrowser.connected) {
    return sharedBrowser;
  }

  if (browserLaunchPromise) {
    return browserLaunchPromise;
  }

  browserLaunchPromise = (async () => {
    const executablePath = resolveChromiumPath();
    console.log(`[Renderer] Lanzando navegador Chromium (${executablePath || "bundled"})...`);

    const browser = await puppeteer.launch({
      headless: true,
      executablePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--disable-extensions",
        "--mute-audio",
        "--disable-background-networking",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-breakpad",
        "--disable-client-side-phishing-detection",
        "--disable-default-apps",
        "--disable-features=Translate,BackForwardCache,AcceptCHFrame,MediaRouter,OptimizationHints",
        "--disable-ipc-flooding-protection",
        "--disable-renderer-backgrounding",
        "--font-render-hinting=none",
      ],
    });

    browser.on("disconnected", () => {
      console.log("[Renderer] Navegador Chromium desconectado, se relanzará en la próxima petición.");
      if (sharedBrowser === browser) {
        sharedBrowser = null;
      }
    });

    sharedBrowser = browser;
    browserLaunchPromise = null;
    return browser;
  })().catch((err) => {
    browserLaunchPromise = null;
    sharedBrowser = null;
    throw err;
  });

  return browserLaunchPromise;
}

// Precalentar el navegador en segundo plano al iniciar el servidor
export function warmUpBrowser() {
  getSharedBrowser()
    .then(() => console.log("[Renderer] Warm browser listo para renderizar al instante."))
    .catch((err) => console.warn("[Renderer] Aviso en precalentamiento de browser:", err.message));
}

/**
 * Motor de renderizado determinista y ultra-rápido de HTML a MP4:
 * 1. Usa el navegador precalentado y mantiene el layout nativo 1080x1920 con escalado eficiente.
 * 2. Captura los fotogramas con presupuesto de tiempo adaptativo para nunca exceder límites de CPU/timeout.
 * 3. Cierra la pestaña de Chromium antes de codificar con FFmpeg para reducir el consumo de RAM a la mitad.
 */
export async function renderHtmlToMp4({
  html,
  duration = 15,
  fps = 24,
  width = 1080,
  height = 1920,
  cleanVideo = true,
  outputPath,
  onProgress,
}) {
  const safeDuration = Math.min(Math.max(Number(duration) || 15, 1), 120);
  const layoutWidth = Number(width) || 1080;
  const layoutHeight = Number(height) || 1920;

  // Escala de rasterizado 0.5 (540x960 sobre layout exacto 1080x1920) para máxima velocidad y bajo uso de RAM
  const scaleFactor = layoutWidth > 720 ? 0.5 : 1;
  const finalHtml = sanitizeHtml(html, layoutWidth, layoutHeight, cleanVideo !== false);

  console.log(
    `[Renderer] Renderizando: layout ${layoutWidth}x${layoutHeight} (scale ${scaleFactor}), duración: ${safeDuration}s, modoLimpio: ${cleanVideo}`
  );

  let browser = await getSharedBrowser();
  let page = null;
  const frameBuffers = [];
  let targetFrames = Math.min(Math.max(Math.round(safeDuration * Math.min(fps, 15)), 24), 150);

  try {
    try {
      page = await browser.newPage();
    } catch {
      // Si la instancia compartida falló, relanzar navegador limpio
      sharedBrowser = null;
      browser = await getSharedBrowser();
      page = await browser.newPage();
    }

    page.setDefaultNavigationTimeout(8000);
    page.setDefaultTimeout(8000);

    await page.setViewport({
      width: layoutWidth,
      height: layoutHeight,
      deviceScaleFactor: scaleFactor,
    });

    await page.evaluateOnNewDocument(VIRTUAL_CLOCK_SCRIPT);

    // Cargar el HTML esperando recursos rápidos (hasta 2.5s máximo) sin fallar si un CDN externo tarda
    await Promise.race([
      page.setContent(finalHtml, { waitUntil: "load" }).catch(() => {}),
      new Promise((r) => setTimeout(r, 2500)),
    ]);

    // Garantizar que el reloj virtual y el auto-play estén inicializados
    await page.evaluate(() => {
      if (typeof window.__triggerAutoPlay === "function") {
        window.__triggerAutoPlay();
      }
    }).catch(() => {});

    // Esperar fuentes listas (máximo 600ms)
    await Promise.race([
      page.evaluate(() => document.fonts?.ready).catch(() => {}),
      new Promise((r) => setTimeout(r, 600)),
    ]);

    const cdp = await page.createCDPSession();

    // Capturar Frame 0 (calienta el compositor y caché de capas Skia)
    await page.evaluate(() => {
      if (typeof window.__stepVirtualTime === "function") {
        window.__stepVirtualTime(0);
      }
    });
    const firstShot = await cdp.send("Page.captureScreenshot", {
      format: "jpeg",
      quality: 80,
      optimizeForSpeed: true,
    });
    const firstFrameBuffer = Buffer.from(firstShot.data, "base64");
    frameBuffers.push(firstFrameBuffer);

    // Medir tiempo real de captura en Frame 1 (ya con compositor caliente)
    const tFrame1 = Date.now();
    const probeMs = Math.min(100, safeDuration * 1000 * 0.02);
    await page.evaluate(async (timeMs) => {
      if (typeof window.__stepVirtualTime === "function") {
        window.__stepVirtualTime(timeMs);
      }
      var videos = Array.from(document.querySelectorAll("video"));
      if (videos.length > 0) {
        await Promise.race([
          Promise.all(
            videos.map(function (v) {
              return new Promise(function (resolve) {
                if (v.seeking) {
                  v.onseeked = function () { resolve(); };
                  setTimeout(resolve, 35);
                } else {
                  resolve();
                }
              });
            })
          ),
          new Promise(function (r) { setTimeout(r, 50); }),
        ]);
      }
      void document.body.offsetHeight;
    }, probeMs);
    const secondShot = await cdp.send("Page.captureScreenshot", {
      format: "jpeg",
      quality: 80,
      optimizeForSpeed: true,
    });
    const secondFrameBuffer = Buffer.from(secondShot.data, "base64");
    const warmFrameMs = Math.max(12, Date.now() - tFrame1);

    // Presupuesto objetivo de captura de 7.5 segundos para garantizar velocidad y fluidez
    const captureBudgetMs = 7500;
    const maxAffordableFrames = Math.floor(captureBudgetMs / warmFrameMs);
    targetFrames = Math.min(
      targetFrames,
      Math.max(36, Math.min(150, maxAffordableFrames))
    );

    console.log(
      `[Renderer] Calibración CPU: frame caliente en ${warmFrameMs}ms -> capturando ${targetFrames} fotogramas para ${safeDuration}s`
    );

    frameBuffers.push(secondFrameBuffer);
    const loopStartTime = Date.now();
    const totalDurationMs = safeDuration * 1000;

    for (let i = 2; i < targetFrames; i++) {
      const elapsedLoopMs = Date.now() - loopStartTime;

      // Si el servidor en la nube sufre throttling severo de CPU (>8s), sub-muestreamos para terminar a tiempo
      if (elapsedLoopMs > 8000 && i < targetFrames - 1 && i % 2 === 1) {
        frameBuffers.push(frameBuffers[frameBuffers.length - 1]);
        continue;
      }

      const currentMs = (i / Math.max(1, targetFrames - 1)) * totalDurationMs;

      await page.evaluate(async (timeMs) => {
        if (typeof window.__stepVirtualTime === "function") {
          window.__stepVirtualTime(timeMs);
        }
        var videos = Array.from(document.querySelectorAll("video"));
        if (videos.length > 0) {
          await Promise.race([
            Promise.all(
              videos.map(function (v) {
                return new Promise(function (resolve) {
                  if (v.seeking) {
                    v.onseeked = function () { resolve(); };
                    setTimeout(resolve, 35);
                  } else {
                    resolve();
                  }
                });
              })
            ),
            new Promise(function (r) { setTimeout(r, 50); }),
          ]);
        }
        void document.body.offsetHeight;
      }, currentMs);

      const shot = await cdp.send("Page.captureScreenshot", {
        format: "jpeg",
        quality: 78,
        optimizeForSpeed: true,
      });

      frameBuffers.push(Buffer.from(shot.data, "base64"));

      if (onProgress && (i % 15 === 0 || i === targetFrames - 1)) {
        const percent = Math.round(((i + 1) / targetFrames) * 100);
        onProgress({
          frame: i + 1,
          totalFrames: targetFrames,
          percent,
          currentTimeSeconds: (currentMs / 1000).toFixed(1),
        });
      }
    }

    await cdp.detach().catch(() => {});
  } finally {
    // Cerrar la página ANTES de lanzar FFmpeg para liberar memoria RAM en contenedores de 512MB
    if (page) {
      await page.close().catch(() => {});
    }
  }

  // Calcular el framerate exacto para que el archivo MP4 dure exactamente `safeDuration` segundos
  const effectiveCaptureFps = (frameBuffers.length / safeDuration).toFixed(4);

  const ffmpegArgs = [
    "-y",
    "-f", "image2pipe",
    "-vcodec", "mjpeg",
    "-framerate", String(effectiveCaptureFps),
    "-i", "-",
    "-r", "24",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-crf", "23",
    "-threads", "2",
    "-pix_fmt", "yuv420p",
    "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2",
    "-movflags", "+faststart",
    outputPath,
  ];

  const ffmpegProcess = spawn(FFMPEG_PATH, ffmpegArgs);
  ffmpegProcess.stdin.on("error", (err) => {
    console.warn("[FFmpeg stdin warning]:", err.message);
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
        reject(
          new Error(`FFmpeg finalizó con código ${code}: ${ffmpegErrorLog.slice(-400)}`)
        );
      }
    });
    ffmpegProcess.on("error", (err) => {
      reject(new Error(`Fallo al ejecutar FFmpeg (${FFMPEG_PATH}): ${err.message}`));
    });
  });

  for (const buf of frameBuffers) {
    if (!ffmpegProcess.stdin.write(buf)) {
      await new Promise((resolve) => ffmpegProcess.stdin.once("drain", resolve));
    }
  }

  ffmpegProcess.stdin.end();
  await ffmpegPromise;

  console.log(`[Renderer] ¡Video MP4 generado con éxito!: ${outputPath} (${frameBuffers.length} frames)`);
  return {
    success: true,
    outputPath,
    duration: safeDuration,
    fps: Number(effectiveCaptureFps),
    totalFrames: frameBuffers.length,
  };
}
