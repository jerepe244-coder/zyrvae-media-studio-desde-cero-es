"use client";

import { Muxer, ArrayBufferTarget } from "mp4-muxer";

export interface BrowserRenderOptions {
  html: string;
  durationSeconds: number;
  width?: number;
  height?: number;
  onProgress?: (percent: number, statusText: string) => void;
}

/**
 * Pintor de respaldo directo sobre Canvas 2D leyendo el layout real (getBoundingClientRect + getComputedStyle)
 * del iframe en caso de que el HTML contenga recursos externos que impidan usar SVG foreignObject.
 */
function paintDomToCanvas2D(
  doc: Document,
  win: Window,
  ctx: CanvasRenderingContext2D,
  scaleX: number,
  scaleY: number,
  layoutWidth: number,
  layoutHeight: number
) {
  ctx.save();
  ctx.scale(scaleX, scaleY);

  // Fondo base
  const bodyStyle = win.getComputedStyle(doc.body);
  ctx.fillStyle =
    bodyStyle.backgroundColor && bodyStyle.backgroundColor !== "rgba(0, 0, 0, 0)"
      ? bodyStyle.backgroundColor
      : "#09090b";
  ctx.fillRect(0, 0, layoutWidth, layoutHeight);

  const elements = Array.from(doc.body.querySelectorAll("*"));
  for (const el of elements) {
    if (!(el instanceof HTMLElement)) continue;
    const style = win.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) {
      continue;
    }

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) continue;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, Number(style.opacity) || 1));

    const bgColor = style.backgroundColor;
    const bgImage = style.backgroundImage;
    const radius = parseFloat(style.borderRadius) || 0;

    // Dibujar caja o fondo si tiene color o gradiente
    if (
      (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") ||
      (bgImage && bgImage !== "none" && ! style.webkitBackgroundClip?.includes("text"))
    ) {
      ctx.beginPath();
      if (radius > 0 && typeof ctx.roundRect === "function") {
        ctx.roundRect(rect.left, rect.top, rect.width, rect.height, Math.min(radius, rect.width / 2, rect.height / 2));
      } else {
        ctx.rect(rect.left, rect.top, rect.width, rect.height);
      }

      if (bgImage && bgImage.includes("gradient")) {
        const grad = ctx.createLinearGradient(rect.left, rect.top, rect.right, rect.bottom);
        const colorMatches = bgImage.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g);
        if (colorMatches && colorMatches.length >= 2) {
          grad.addColorStop(0, colorMatches[0]);
          grad.addColorStop(1, colorMatches[colorMatches.length - 1]);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = bgColor !== "rgba(0, 0, 0, 0)" ? bgColor : "#18181b";
        }
      } else {
        ctx.fillStyle = bgColor;
      }
      ctx.fill();
    }

    // Bordes
    const borderWidth = parseFloat(style.borderTopWidth) || 0;
    if (borderWidth > 0 && style.borderTopColor && style.borderTopColor !== "rgba(0, 0, 0, 0)") {
      ctx.lineWidth = borderWidth;
      ctx.strokeStyle = style.borderTopColor;
      ctx.stroke();
    }

    // Texto directo del nodo
    let directText = "";
    for (const node of Array.from(el.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        directText += node.textContent || "";
      }
    }
    directText = directText.trim();

    if (directText) {
      const fontSize = parseFloat(style.fontSize) || 24;
      const fontWeight = style.fontWeight || "600";
      const fontFamily = style.fontFamily || "sans-serif";
      ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      ctx.fillStyle =
        style.webkitTextFillColor &&
        style.webkitTextFillColor !== "rgba(0, 0, 0, 0)" &&
        style.webkitTextFillColor !== "transparent"
          ? style.webkitTextFillColor
          : style.color && style.color !== "rgba(0, 0, 0, 0)"
          ? style.color
          : "#ffffff";
      ctx.textBaseline = "top";

      const words = directText.split(/\s+/);
      let line = "";
      let y = rect.top + (parseFloat(style.paddingTop) || 0);
      const x = rect.left + (parseFloat(style.paddingLeft) || 0);
      const maxWidth = Math.max(100, rect.width - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0));
      const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.25;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line.trim(), x, y);
          line = words[n] + " ";
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), x, y);
    }

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Renderiza el documento HTML del iframe en un fotograma del Canvas usando SVG foreignObject
 * con fallback automático a Canvas 2D directo.
 */
async function renderFrameToCanvas(
  doc: Document,
  win: Window,
  ctx: CanvasRenderingContext2D,
  outWidth: number,
  outHeight: number,
  layoutWidth: number,
  layoutHeight: number,
  currentTimeMs: number
): Promise<void> {
  try {
    // 1. Avanzar todas las animaciones CSS / Web Animations API del documento al tiempo exacto
    if (doc.documentElement && typeof doc.documentElement.getAnimations === "function") {
      const anims = doc.documentElement.getAnimations({ subtree: true });
      for (const anim of anims) {
        try {
          anim.pause();
          anim.currentTime = currentTimeMs;
        } catch {}
      }
    }

    const winAny = win as unknown as { __stepVirtualTime?: (ms: number) => void };
    if (typeof winAny.__stepVirtualTime === "function") {
      try {
        winAny.__stepVirtualTime(currentTimeMs);
      } catch {}
    }

    // 2. Clonar el árbol HTML e inyectar el congelamiento exacto de keyframes en `currentTimeMs`
    const cloneHtml = doc.documentElement.cloneNode(true) as HTMLElement;
    cloneHtml.querySelectorAll("script, link[rel='stylesheet'], iframe, video, audio").forEach((n) => n.remove());

    // Recopilar reglas CSS locales para el foreignObject
    let cssText = "";
    for (const sheet of Array.from(doc.styleSheets)) {
      try {
        for (const rule of Array.from(sheet.cssRules)) {
          cssText += rule.cssText + "\n";
        }
      } catch {}
    }

    const timeSec = (currentTimeMs / 1000).toFixed(3);
    const freezeStyle = doc.createElement("style");
    freezeStyle.textContent = `
      ${cssText}
      html, body {
        width: ${layoutWidth}px !important;
        height: ${layoutHeight}px !important;
        margin: 0 !important;
        overflow: hidden !important;
      }
      *, *::before, *::after {
        animation-delay: -${timeSec}s !important;
        animation-play-state: paused !important;
        transition: none !important;
      }
    `;

    let head = cloneHtml.querySelector("head");
    if (!head) {
      head = doc.createElement("head");
      cloneHtml.insertBefore(head, cloneHtml.firstChild);
    }
    head.appendChild(freezeStyle);

    cloneHtml.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
    const serializedXhtml = new XMLSerializer().serializeToString(cloneHtml);

    const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="${outWidth}" height="${outHeight}" viewBox="0 0 ${layoutWidth} ${layoutHeight}">
      <foreignObject width="${layoutWidth}" height="${layoutHeight}">
        ${serializedXhtml}
      </foreignObject>
    </svg>`;

    const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;

    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      const timer = setTimeout(() => reject(new Error("SVG load timeout")), 600);
      img.onload = () => {
        clearTimeout(timer);
        ctx.clearRect(0, 0, outWidth, outHeight);
        ctx.drawImage(img, 0, 0, outWidth, outHeight);
        resolve();
      };
      img.onerror = (err) => {
        clearTimeout(timer);
        reject(err);
      };
      img.src = dataUrl;
    });
  } catch {
    // Fallback garantizado si el SVG contiene entidades o imágenes externas
    paintDomToCanvas2D(
      doc,
      win,
      ctx,
      outWidth / layoutWidth,
      outHeight / layoutHeight,
      layoutWidth,
      layoutHeight
    );
  }
}

/**
 * Convierte cualquier código HTML en un archivo de video .MP4 (H.264 ISO-BMFF) directamente en el navegador
 * usando WebCodecs VideoEncoder + mp4-muxer (o MediaRecorder como respaldo).
 */
export async function renderHtmlToMp4InBrowser({
  html,
  durationSeconds = 15,
  width = 1080,
  height = 1920,
  onProgress,
}: BrowserRenderOptions): Promise<Blob> {
  const safeDuration = Math.min(Math.max(Number(durationSeconds) || 15, 1), 120);
  const outWidth = 540;
  const outHeight = 960;
  const fps = safeDuration <= 15 ? 15 : safeDuration <= 30 ? 12 : 10;
  const totalFrames = Math.max(24, Math.min(240, Math.round(safeDuration * fps)));

  onProgress?.(5, "Inicializando motor de renderizado local...");

  // Crear iframe oculto same-origin con dimensiones exactas 1080x1920
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.top = "0";
  iframe.style.width = `${width}px`;
  iframe.style.height = `${height}px`;
  iframe.style.border = "0";
  iframe.style.pointerEvents = "none";
  iframe.style.opacity = "0";
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;
    if (!doc || !win) {
      throw new Error("No se pudo inicializar el contenedor de renderizado.");
    }

    doc.open();
    doc.write(html);
    doc.close();

    // Esperar a que carguen estilos y fuentes (máximo 800ms)
    await Promise.race([
      doc.fonts?.ready || Promise.resolve(),
      new Promise((r) => setTimeout(r, 800)),
    ]);
    await new Promise((r) => setTimeout(r, 120));

    const canvas = document.createElement("canvas");
    canvas.width = outWidth;
    canvas.height = outHeight;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      throw new Error("No se pudo crear el contexto gráfico 2D.");
    }

    // Ruta A: WebCodecs VideoEncoder + mp4-muxer (genera MP4 H.264 nativo ultra-rápido)
    if (typeof window !== "undefined" && "VideoEncoder" in window && "VideoFrame" in window) {
      const target = new ArrayBufferTarget();
      const muxer = new Muxer({
        target,
        video: {
          codec: "avc",
          width: outWidth,
          height: outHeight,
        },
        fastStart: "in-memory",
      });

      let encoderError: Error | null = null;
      const encoder = new VideoEncoder({
        output: (chunk, meta) => {
          muxer.addVideoChunk(chunk, meta);
        },
        error: (err) => {
          encoderError = err instanceof Error ? err : new Error(String(err));
        },
      });

      // Buscar perfil H.264 compatible
      const candidateCodecs = ["avc1.42001f", "avc1.4d001f", "avc1.42E01E", "avc1.640028"];
      let selectedCodec = "avc1.42001f";
      for (const c of candidateCodecs) {
        try {
          const support = await VideoEncoder.isConfigSupported({
            codec: c,
            width: outWidth,
            height: outHeight,
            bitrate: 2_500_000,
            framerate: fps,
          });
          if (support.supported) {
            selectedCodec = c;
            break;
          }
        } catch {}
      }

      encoder.configure({
        codec: selectedCodec,
        width: outWidth,
        height: outHeight,
        bitrate: 2_500_000,
        framerate: fps,
      });

      const totalDurationMs = safeDuration * 1000;
      const frameDurationUs = Math.round((safeDuration * 1_000_000) / totalFrames);

      for (let i = 0; i < totalFrames; i++) {
        if (encoderError) throw encoderError;

        const currentTimeMs = (i / Math.max(1, totalFrames - 1)) * totalDurationMs;
        await renderFrameToCanvas(doc, win, ctx, outWidth, outHeight, width, height, currentTimeMs);

        const timestampUs = Math.round(i * frameDurationUs);
        const videoFrame = new VideoFrame(canvas, {
          timestamp: timestampUs,
          duration: frameDurationUs,
        });

        encoder.encode(videoFrame, { keyFrame: i % 15 === 0 });
        videoFrame.close();

        const pct = Math.min(96, Math.round(10 + ((i + 1) / totalFrames) * 85));
        onProgress?.(pct, `Codificando fotograma ${i + 1} de ${totalFrames}...`);

        // Ceder el hilo principal cada 4 fotogramas para que la página nunca se trabe
        if (i % 4 === 0) {
          await new Promise((r) => setTimeout(r, 0));
        }
      }

      onProgress?.(98, "Empaquetando archivo MP4...");
      await encoder.flush();
      encoder.close();
      muxer.finalize();

      onProgress?.(100, "¡Video MP4 listo!");
      return new Blob([target.buffer], { type: "video/mp4" });
    }

    // Ruta B: Respaldo con MediaRecorder si el navegador no soporta WebCodecs
    const stream = canvas.captureStream(fps);
    const mimeTypes = [
      "video/mp4;codecs=avc1",
      "video/mp4",
      "video/webm;codecs=h264",
      "video/webm",
    ];
    const supportedMime = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) || "";
    const recorder = new MediaRecorder(
      stream,
      supportedMime ? { mimeType: supportedMime, videoBitsPerSecond: 2_500_000 } : undefined
    );

    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const stopPromise = new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        resolve(new Blob(chunks, { type: "video/mp4" }));
      };
    });

    recorder.start(100);
    const totalDurationMs = safeDuration * 1000;
    for (let i = 0; i < totalFrames; i++) {
      const currentTimeMs = (i / Math.max(1, totalFrames - 1)) * totalDurationMs;
      await renderFrameToCanvas(doc, win, ctx, outWidth, outHeight, width, height, currentTimeMs);
      const pct = Math.min(96, Math.round(10 + ((i + 1) / totalFrames) * 85));
      onProgress?.(pct, `Generando fotograma ${i + 1} de ${totalFrames}...`);
      await new Promise((r) => setTimeout(r, 25));
    }

    recorder.stop();
    const finalBlob = await stopPromise;
    onProgress?.(100, "¡Video MP4 listo!");
    return finalBlob;
  } finally {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  }
}
