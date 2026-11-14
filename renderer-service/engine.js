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
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

const FFMPEG_PATH = resolveFfmpegPath();

// Script único de reloj virtual determinista y sincronización WAAPI + doble rAF real
const VIRTUAL_CLOCK_SCRIPT = `
(function() {
  if (window.__virtualClockInitialized) return;
  window.__virtualClockInitialized = true;
  window.__virtualTime = 0;

  var origRAF = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : null;
  var origCancelRAF = window.cancelAnimationFrame ? window.cancelAnimationFrame.bind(window) : null;

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

  // Espera dos cuadros reales del compositor (doble rAF nativo) tras posicionar WAAPI
  window.__waitForDoubleRaf = function() {
    if (!origRAF) {
      return new Promise(function(resolve) { setTimeout(resolve, 16); });
    }
    return new Promise(function(resolve) {
      var settled = false;
      var guard = setTimeout(function() {
        if (!settled) {
          settled = true;
          resolve();
        }
      }, 80);
      origRAF(function() {
        origRAF(function() {
          if (!settled) {
            settled = true;
            clearTimeout(guard);
            resolve();
          }
        });
      });
    });
  };

  // Función de disparo automático para iniciar cualquier video o animación interactiva
  window.__triggerAutoPlay = function() {
    try {
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

      var playButtons = document.querySelectorAll(
        'button, [role="button"], .play, #play, .play-btn, .btn-play, [aria-label*="play" i], [aria-label*="reproducir" i]'
      );
      for (var b = 0; b < playButtons.length; b++) {
        try {
          playButtons[b].click();
        } catch (e) {}
      }

      window.dispatchEvent(new Event('play'));
      window.dispatchEvent(new CustomEvent('video-start'));
      document.dispatchEvent(new Event('play'));
    } catch (err) {}
  };

  // Stepper determinista fotograma a fotograma mediante Web Animations API + Virtual Clock
  window.__stepVirtualTime = function(newTimeMs) {
    window.__virtualTime = newTimeMs;

    // 1. Ejecutar callbacks de requestAnimationFrame registrados por el código de la escena
    var pending = Array.from(rafCallbacks.entries());
    rafCallbacks.clear();
    for (var i = 0; i < pending.length; i++) {
      try {
        pending[i][1](newTimeMs);
      } catch (e) {}
    }

    // 2. Posicionar todas las animaciones CSS (@keyframes) y WAAPI con precisión de milisegundos
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

    // 3. Sincronizar fotogramas de etiquetas <video> si existen
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

    // 4. Actualizar variables CSS personalizadas
    if (document.documentElement) {
      try {
        document.documentElement.style.setProperty('--virtual-time', newTimeMs + 'ms');
        document.documentElement.style.setProperty('--virtual-seconds', (newTimeMs / 1000) + 's');
      } catch (e) {}
    }

    // 5. Hook personalizado si el script define __seekToTime
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
export function sanitizeHtml(rawHtml, width = 1080, height = 1920, cleanVideo = true, duration = 15) {
  let html = String(rawHtml || "").trim();
  const safeDuration = Math.min(Math.max(Number(duration) || 15, 1), 120);

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

  const hasKeyframes = /@keyframes/i.test(html);
  const autoCinematicRules = !hasKeyframes
    ? `
    @keyframes __zyrvae_cinematic_motion {
      0% { transform: scale(1) translateY(0); }
      50% { transform: scale(1.04) translateY(-8px); }
      100% { transform: scale(1.08) translateY(0); }
    }
    img, .bg, .hero, .card, .main, [class*="card"], [class*="hero"], [class*="poster"], [class*="banner"] {
      animation: __zyrvae_cinematic_motion ${safeDuration}s ease-in-out infinite alternate !important;
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
    ${autoCinematicRules}
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

export function warmUpBrowser() {
  getSharedBrowser()
    .then(() => console.log("[Renderer] Warm browser listo para renderizar al instante."))
    .catch((err) => console.warn("[Renderer] Aviso en precalentamiento de browser:", err.message));
}

/**
 * Motor de renderizado determinista cuadro a cuadro sin límites artificiales ni frame-dropping:
 * 1. Captura exactamente Math.round(safeDuration * safeFps) fotogramas reales en PNG vía CDP.
 * 2. Posiciona CSS @keyframes y WAAPI con document.getAnimations() + doble requestAnimationFrame real.
 * 3. Transmite cada fotograma por streaming directo a FFmpeg (libx264, -preset medium, -crf 18) con audio opcional.
 */
export async function renderHtmlToMp4({
  html,
  duration = 15,
  fps = 30,
  width = 1080,
  height = 1920,
  cleanVideo = true,
  audioPath = null,
  voiceoverPath = null,
  sfxItems = [],
  outputPath,
  onProgress,
}) {
  const safeDuration = Math.min(Math.max(Number(duration) || 15, 1), 120);
  const safeFps = Math.min(Math.max(Math.round(Number(fps) || 30), 1), 60);
  const layoutWidth = Math.min(Math.max(Math.round(Number(width) || 1080), 200), 3840);
  const layoutHeight = Math.min(Math.max(Math.round(Number(height) || 1920), 200), 3840);
  const targetFrames = Math.max(1, Math.round(safeDuration * safeFps));

  const finalHtml = sanitizeHtml(html, layoutWidth, layoutHeight, cleanVideo !== false, safeDuration);

  console.log(
    `[Renderer] Render determinista: ${layoutWidth}x${layoutHeight}, ${safeDuration}s @ ${safeFps}fps (${targetFrames} cuadros)`
  );

  let browser = await getSharedBrowser();
  let page = null;
  let cdp = null;

  const hasMusic = Boolean(audioPath && fs.existsSync(audioPath));
  const hasVoiceover = Boolean(voiceoverPath && fs.existsSync(voiceoverPath));
  const validSfx = Array.isArray(sfxItems)
    ? sfxItems.filter(
        (item) =>
          item &&
          typeof item.path === "string" &&
          fs.existsSync(item.path) &&
          Number.isFinite(Number(item.timeSec)) &&
          Number(item.timeSec) >= 0 &&
          Number(item.timeSec) < safeDuration
      )
    : [];

  const ffmpegArgs = [
    "-y",
    "-f", "image2pipe",
    "-vcodec", "png",
    "-framerate", String(safeFps),
    "-i", "-",
  ];

  let nextInputIdx = 1;
  let musicIdx = -1;
  let voIdx = -1;
  const sfxMapped = [];

  if (hasMusic) {
    musicIdx = nextInputIdx++;
    ffmpegArgs.push("-stream_loop", "-1", "-i", audioPath);
  }
  if (hasVoiceover) {
    voIdx = nextInputIdx++;
    ffmpegArgs.push("-i", voiceoverPath);
  }
  for (const sfx of validSfx) {
    const idx = nextInputIdx++;
    ffmpegArgs.push("-i", sfx.path);
    sfxMapped.push({
      idx,
      timeSec: Number(sfx.timeSec),
      volume: Math.min(1.5, Math.max(0.05, Number(sfx.volume) || 0.85)),
    });
  }

  ffmpegArgs.push(
    "-r", String(safeFps),
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2"
  );

  const hasAnyAudioTrack = hasMusic || hasVoiceover || sfxMapped.length > 0;
  if (hasAnyAudioTrack) {
    const filterSteps = [
      `anullsrc=channel_layout=stereo:sample_rate=44100:d=${safeDuration}[base]`,
    ];
    const mixInputs = ["[base]"];

    if (hasMusic) {
      const musicVol = hasVoiceover ? "0.20" : "0.55";
      filterSteps.push(
        `[${musicIdx}:a]aresample=44100,aformat=channel_layouts=stereo,volume=${musicVol}[bg]`
      );
      mixInputs.push("[bg]");
    }

    if (hasVoiceover) {
      filterSteps.push(
        `[${voIdx}:a]aresample=44100,aformat=channel_layouts=stereo,volume=1.0[vo]`
      );
      mixInputs.push("[vo]");
    }

    sfxMapped.forEach((sfx, k) => {
      const delayMs = Math.max(0, Math.round(sfx.timeSec * 1000));
      filterSteps.push(
        `[${sfx.idx}:a]aresample=44100,aformat=channel_layouts=stereo,adelay=${delayMs}|${delayMs},volume=${sfx.volume.toFixed(2)}[sfx${k}]`
      );
      mixInputs.push(`[sfx${k}]`);
    });

    filterSteps.push(
      `${mixInputs.join("")}amix=inputs=${mixInputs.length}:duration=first:normalize=0[aout]`
    );

    ffmpegArgs.push(
      "-filter_complex",
      filterSteps.join(";"),
      "-map", "0:v:0",
      "-map", "[aout]",
      "-c:a", "aac",
      "-b:a", "192k",
      "-shortest"
    );
  }

  ffmpegArgs.push("-movflags", "+faststart", outputPath);

  const ffmpegProcess = spawn(FFMPEG_PATH, ffmpegArgs);
  let stdinClosed = false;

  ffmpegProcess.stdin.on("error", (err) => {
    if (!stdinClosed) {
      console.warn("[FFmpeg stdin warning]:", err.message);
    }
  });

  let ffmpegErrorLog = "";
  let encodingStarted = false;

  ffmpegProcess.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    ffmpegErrorLog += text;
    if (ffmpegErrorLog.length > 8000) {
      ffmpegErrorLog = ffmpegErrorLog.slice(-6000);
    }

    if (encodingStarted && onProgress) {
      const match = text.match(/frame=\s*(\d+)/);
      if (match) {
        const encodedFrame = Math.min(targetFrames, parseInt(match[1], 10));
        const encPct = Math.min(99, 85 + Math.round((encodedFrame / targetFrames) * 14));
        onProgress({
          phase: "encoding",
          frame: targetFrames,
          totalFrames: targetFrames,
          percent: encPct,
          currentTimeSeconds: safeDuration.toFixed(1),
        });
      }
    }
  });

  const ffmpegPromise = new Promise((resolve, reject) => {
    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(
          new Error(`FFmpeg finalizó con código ${code}: ${ffmpegErrorLog.slice(-500)}`)
        );
      }
    });
    ffmpegProcess.on("error", (err) => {
      reject(new Error(`Fallo al ejecutar FFmpeg (${FFMPEG_PATH}): ${err.message}`));
    });
  });

  try {
    try {
      page = await browser.newPage();
    } catch {
      sharedBrowser = null;
      browser = await getSharedBrowser();
      page = await browser.newPage();
    }

    page.setDefaultNavigationTimeout(15000);
    page.setDefaultTimeout(15000);

    await page.setViewport({
      width: layoutWidth,
      height: layoutHeight,
      deviceScaleFactor: 1,
    });

    await page.evaluateOnNewDocument(VIRTUAL_CLOCK_SCRIPT);

    await Promise.race([
      page.setContent(finalHtml, { waitUntil: "load" }).catch(() => {}),
      new Promise((r) => setTimeout(r, 4000)),
    ]);

    await page.evaluate(() => {
      if (typeof window.__triggerAutoPlay === "function") {
        window.__triggerAutoPlay();
      }
    }).catch(() => {});

    // Esperar fuentes web e imágenes decodificadas antes del cuadro 0
    await Promise.race([
      page.evaluate(async () => {
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready.catch(() => {});
        }
        const imgs = Array.from(document.images || []);
        await Promise.all(
          imgs.map((img) => {
            if (img.complete) {
              return typeof img.decode === "function" ? img.decode().catch(() => {}) : Promise.resolve();
            }
            return new Promise((resolve) => {
              img.addEventListener("load", () => {
                if (typeof img.decode === "function") {
                  img.decode().catch(() => {}).finally(resolve);
                } else {
                  resolve();
                }
              }, { once: true });
              img.addEventListener("error", resolve, { once: true });
            });
          })
        );
      }).catch(() => {}),
      new Promise((r) => setTimeout(r, 3500)),
    ]);

    cdp = await page.createCDPSession();

    for (let i = 0; i < targetFrames; i++) {
      const currentMs = (i / safeFps) * 1000;

      await page.evaluate(async (timeMs) => {
        if (typeof window.__stepVirtualTime === "function") {
          window.__stepVirtualTime(timeMs);
        }
        const videos = Array.from(document.querySelectorAll("video"));
        if (videos.length > 0) {
          await Promise.race([
            Promise.all(
              videos.map((v) => {
                return new Promise((resolve) => {
                  if (v.seeking) {
                    v.onseeked = () => resolve();
                    setTimeout(resolve, 40);
                  } else {
                    resolve();
                  }
                });
              })
            ),
            new Promise((r) => setTimeout(r, 60)),
          ]);
        }
        void document.body.offsetHeight;
        if (typeof window.__waitForDoubleRaf === "function") {
          await window.__waitForDoubleRaf();
        }
      }, currentMs);

      const shot = await cdp.send("Page.captureScreenshot", {
        format: "png",
      });

      const frameBuffer = Buffer.from(shot.data, "base64");
      if (!ffmpegProcess.stdin.write(frameBuffer)) {
        await new Promise((resolve) => ffmpegProcess.stdin.once("drain", resolve));
      }

      if (onProgress && (i === 0 || i % 10 === 0 || i === targetFrames - 1)) {
        const pct = Math.min(85, Math.round(((i + 1) / targetFrames) * 85));
        onProgress({
          phase: "capturing",
          frame: i + 1,
          totalFrames: targetFrames,
          percent: pct,
          currentTimeSeconds: (currentMs / 1000).toFixed(2),
        });
      }
    }

    await cdp.detach().catch(() => {});
    cdp = null;
    await page.close().catch(() => {});
    page = null;

    encodingStarted = true;
    onProgress?.({
      phase: "encoding",
      frame: targetFrames,
      totalFrames: targetFrames,
      percent: 87,
      currentTimeSeconds: safeDuration.toFixed(1),
    });

    stdinClosed = true;
    ffmpegProcess.stdin.end();
    await ffmpegPromise;

    onProgress?.({
      phase: "done",
      frame: targetFrames,
      totalFrames: targetFrames,
      percent: 100,
      currentTimeSeconds: safeDuration.toFixed(1),
    });

    console.log(
      `[Renderer] ¡Video MP4 generado con éxito!: ${outputPath} (${targetFrames} cuadros @ ${safeFps}fps)`
    );

    return {
      success: true,
      outputPath,
      duration: safeDuration,
      fps: safeFps,
      totalFrames: targetFrames,
    };
  } catch (err) {
    stdinClosed = true;
    try {
      ffmpegProcess.stdin.destroy();
    } catch {}
    try {
      ffmpegProcess.kill("SIGKILL");
    } catch {}
    await ffmpegPromise.catch(() => {});
    throw err;
  } finally {
    if (cdp) {
      await cdp.detach().catch(() => {});
    }
    if (page) {
      await page.close().catch(() => {});
    }
  }
}
