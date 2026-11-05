import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// 1. Obtener y validar parámetros del entorno
const rawTitle = process.env.VIDEO_TITLE || "Comercial ZYRVAE";

let duration = 10;
let accentColor = "#6366f1";

if (process.env.VIDEO_DURATION) {
  const parsed = parseInt(String(process.env.VIDEO_DURATION).replace(/[^0-9]/g, ""), 10);
  if (!isNaN(parsed) && parsed > 0 && parsed <= 120) {
    duration = parsed;
  }
}

if (process.env.VIDEO_COLOR) {
  const rawColor = String(process.env.VIDEO_COLOR).trim();
  if (rawColor.startsWith("#") && /^#[0-9a-fA-F]{3,8}$/.test(rawColor)) {
    accentColor = rawColor;
  } else {
    // Si vino como "10s", "15s" o "15" en VIDEO_COLOR
    const parsed = parseInt(rawColor.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 120) {
      duration = parsed;
    }
  }
}

const outputMp4 = process.env.VIDEO_OUTPUT || path.join(process.cwd(), "output.mp4");

// 2. Determinar si el modo solicitado es HTML o Remotion
let isHtmlMode = false;
let rawHtml = "";

if (process.env.VIDEO_MODE === "html" || process.env.RENDER_MODE === "html") {
  isHtmlMode = true;
}

if (process.env.HTML_CODE && process.env.HTML_CODE.trim()) {
  rawHtml = process.env.HTML_CODE.trim();
  isHtmlMode = true;
}

if (process.env.HTML_BASE64 && process.env.HTML_BASE64.trim()) {
  try {
    rawHtml = Buffer.from(process.env.HTML_BASE64.trim(), "base64").toString("utf-8");
    isHtmlMode = true;
  } catch (err) {
    console.warn("Advertencia: No se pudo decodificar HTML_BASE64:", err.message);
  }
}

// Propiedades por defecto para Remotion
let remotionProps = {
  title: rawTitle,
  subtitle: "Imprenta de Video Automatizada",
  description: "Diseño premium de alta conversión con tecnología Remotion para anuncios 9:16 Ultra HD.",
  brandName: "ZYRVAE MEDIA STUDIO",
  accentColor: accentColor,
  badgeText: "Comercial ZYRVAE",
  statsValue: "+300%",
  statsLabel: "Conversión de Marca",
  callToAction: "Potencia tu Negocio Hoy",
};

// Analizar VIDEO_TEXT (puede ser Base64 JSON, JSON plano, HTML en Base64 o HTML plano)
if (process.env.VIDEO_TEXT && process.env.VIDEO_TEXT.trim()) {
  const candidate = process.env.VIDEO_TEXT.trim();

  // A. Probar decodificación Base64
  try {
    const decoded = Buffer.from(candidate, "base64").toString("utf-8");
    if (decoded.trim().startsWith("{")) {
      const parsed = JSON.parse(decoded);
      if (parsed.mode === "html" && parsed.html) {
        isHtmlMode = true;
        rawHtml = parsed.html;
        if (parsed.title) remotionProps.title = parsed.title;
      } else {
        remotionProps = { ...remotionProps, ...parsed };
      }
    } else if (
      decoded.includes("<") &&
      (decoded.includes("<html") ||
        decoded.includes("<!DOCTYPE") ||
        decoded.includes("<body") ||
        decoded.includes("<div") ||
        decoded.includes("<style"))
    ) {
      isHtmlMode = true;
      rawHtml = decoded;
    }
  } catch {
    // No era base64
  }

  // B. Probar texto plano directo
  if (!isHtmlMode) {
    if (candidate.startsWith("{")) {
      try {
        const parsed = JSON.parse(candidate);
        if (parsed.mode === "html" && parsed.html) {
          isHtmlMode = true;
          rawHtml = parsed.html;
          if (parsed.title) remotionProps.title = parsed.title;
        } else {
          remotionProps = { ...remotionProps, ...parsed };
        }
      } catch {
        // No era JSON plano
      }
    } else if (
      candidate.includes("<") &&
      (candidate.includes("<html") ||
        candidate.includes("<!DOCTYPE") ||
        candidate.includes("<body") ||
        candidate.includes("<div"))
    ) {
      isHtmlMode = true;
      rawHtml = candidate;
    }
  }
}

// Forzar título y color si vinieron por variables explícitas
if (rawTitle && rawTitle !== "Comercial ZYRVAE") {
  remotionProps.title = rawTitle;
}
if (accentColor) {
  remotionProps.accentColor = accentColor;
}

// Asegurar dependencias de googleapis para la subida a Drive
try {
  import.meta.resolve("googleapis");
} catch {
  console.log("Preparando dependencias de exportación...");
  try {
    execSync("npm i googleapis --no-save --no-audit --no-fund", { stdio: "ignore" });
  } catch {
    // ignore
  }
}

// -------------------------------------------------------------
// CASO 1: MODO HTML -> VIDEO MP4 (Vía HyperFrames)
// -------------------------------------------------------------
if (isHtmlMode && rawHtml) {
  console.log("=== INICIANDO MOTOR DE RENDERIZADO HTML -> MP4 (HYPERFRAMES) ===");
  console.log(`Título: "${rawTitle}"`);
  console.log(`Duración: ${duration}s`);
  console.log(`Destino MP4: ${outputMp4}`);

  function prepareCompositionHtml(htmlString, targetDuration) {
    let html = htmlString.trim();

    // Envolver si es un snippet sin <html> o <!doctype>
    if (!html.toLowerCase().includes("<html") && !html.toLowerCase().includes("<!doctype")) {
      html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, height=1920">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 1080px; height: 1920px; overflow: hidden; background: #09090b; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
    }

    if (!html.toLowerCase().includes("charset")) {
      html = html.replace(/<head([^>]*)>/i, '<head$1>\n  <meta charset="UTF-8">');
    }

    const hasTimelines = html.includes("window.__timelines");
    const hasCompositionId = html.includes("data-composition-id");
    const hasDuration = html.includes("data-duration");
    const hasNoTimeline = html.includes("data-no-timeline");

    if (!hasCompositionId) {
      if (html.toLowerCase().includes("<body")) {
        html = html.replace(/<body([^>]*)>/i, (match, attrs) => {
          let newAttrs = attrs || "";
          newAttrs += ` data-composition-id="main"`;
          if (!hasDuration) {
            newAttrs += ` data-duration="${targetDuration}"`;
          }
          newAttrs += ` data-width="1080" data-height="1920" data-fps="30"`;
          if (!hasTimelines && !hasNoTimeline) {
            newAttrs += ` data-no-timeline`;
          }
          return `<body${newAttrs}>`;
        });
      } else {
        html = `<div data-composition-id="main" data-duration="${targetDuration}" data-width="1080" data-height="1920" data-fps="30" ${!hasTimelines ? "data-no-timeline" : ""}>\n${html}\n</div>`;
      }
    } else {
      if (/data-duration=["'][^"']*["']/i.test(html)) {
        html = html.replace(/data-duration=["']([^"']*)["']/i, `data-duration="${targetDuration}"`);
      } else {
        html = html.replace(/(data-composition-id=["'][^"']+["'])/i, `$1 data-duration="${targetDuration}"`);
      }
      if (!/data-width=["'][^"']*["']/i.test(html)) {
        html = html.replace(/(data-composition-id=["'][^"']+["'])/i, `$1 data-width="1080" data-height="1920" data-fps="30"`);
      }
      if (!hasTimelines && !hasNoTimeline) {
        html = html.replace(/(data-composition-id=["'][^"']+["'])/i, `$1 data-no-timeline`);
      }
    }

    // Sincronizar animaciones de progreso CSS con la duración seleccionada
    html = html.replace(/fillProgress\s+\d+s/gi, `fillProgress ${targetDuration}s`);
    html = html.replace(/progressAnim\s+\d+s/gi, `progressAnim ${targetDuration}s`);

    return html;
  }

  const finalHtml = prepareCompositionHtml(rawHtml, duration);
  const compDir = path.join(process.cwd(), ".render-comp");
  if (fs.existsSync(compDir)) {
    fs.rmSync(compDir, { recursive: true, force: true });
  }
  fs.mkdirSync(compDir, { recursive: true });

  const hfConfig = {
    $schema: "https://hyperframes.heygen.com/schema/hyperframes.json",
  };
  fs.writeFileSync(path.join(compDir, "hyperframes.json"), JSON.stringify(hfConfig, null, 2));
  fs.writeFileSync(path.join(compDir, "index.html"), finalHtml, "utf-8");

  try {
    console.log("Renderizando HTML a video MP4 1080x1920 con HyperFrames...");
    execSync(
      `npx hyperframes render "${compDir}" -o "${outputMp4}" --quality standard --low-memory-mode --no-browser-gpu --fps 30 --player-ready-timeout 15000`,
      {
        stdio: "inherit",
      }
    );

    if (!fs.existsSync(outputMp4) || fs.statSync(outputMp4).size === 0) {
      throw new Error("El archivo MP4 generado desde HTML no existe o está vacío.");
    }

    const stats = fs.statSync(outputMp4);
    console.log(`\n🎉 ¡HTML convertido a MP4 con éxito! Archivo: ${outputMp4} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  } finally {
    try {
      fs.rmSync(compDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
} else {
  // -------------------------------------------------------------
  // CASO 2: MODO REMOTION (Plantilla React Ultra HD)
  // -------------------------------------------------------------
  const durationInFrames = Math.max(30, Math.min(3600, duration * 30));

  console.log("=== INICIANDO MOTOR DE RENDERIZADO REMOTION (ZYRVAE MEDIA STUDIO) ===");
  console.log(`Título: "${remotionProps.title}"`);
  console.log(`Duración: ${duration}s (${durationInFrames} frames a 30fps)`);
  console.log(`Color de acento: ${accentColor}`);
  console.log(`Destino MP4: ${outputMp4}`);

  const propsPath = path.join(process.cwd(), ".remotion-props.json");
  remotionProps.durationInSeconds = duration;
  fs.writeFileSync(propsPath, JSON.stringify(remotionProps, null, 2), "utf-8");
  const entryPoint = path.join(process.cwd(), "src/remotion/entry.ts");

  try {
    console.log("Renderizando composición 'Commercial' a 1080x1920 30fps con Remotion...");
    execSync(
      `npx remotion render "${entryPoint}" Commercial "${outputMp4}" --props="${propsPath}" --frames=0-${durationInFrames - 1} --concurrency=2 --quiet`,
      {
        stdio: "inherit",
      }
    );

    if (!fs.existsSync(outputMp4) || fs.statSync(outputMp4).size === 0) {
      throw new Error("El archivo de video generado con Remotion no existe o está vacío.");
    }

    const stats = fs.statSync(outputMp4);
    console.log(`\n🎉 ¡Video renderizado con éxito vía Remotion! Archivo: ${outputMp4} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  } finally {
    try {
      fs.rmSync(propsPath, { force: true });
    } catch {
      // ignore
    }
  }
}
