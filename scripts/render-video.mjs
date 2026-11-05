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

// 2. Obtener y decodificar el código HTML
let rawHtml = "";

// A. Desde HTML_BASE64
if (process.env.HTML_BASE64 && process.env.HTML_BASE64.trim()) {
  try {
    rawHtml = Buffer.from(process.env.HTML_BASE64.trim(), "base64").toString("utf-8");
  } catch (err) {
    console.warn("Advertencia: No se pudo decodificar HTML_BASE64:", err.message);
  }
}

// B. Desde HTML_CODE directo
if (!rawHtml && process.env.HTML_CODE && process.env.HTML_CODE.trim()) {
  rawHtml = process.env.HTML_CODE.trim();
}

// C. Desde VIDEO_TEXT (compatibilidad con workflow_dispatch y base64)
if (!rawHtml && process.env.VIDEO_TEXT && process.env.VIDEO_TEXT.trim()) {
  const candidate = process.env.VIDEO_TEXT.trim();
  try {
    const decoded = Buffer.from(candidate, "base64").toString("utf-8");
    if (
      decoded.includes("<") &&
      (decoded.includes("<html") ||
        decoded.includes("<!DOCTYPE") ||
        decoded.includes("<body") ||
        decoded.includes("<div") ||
        decoded.includes("<style"))
    ) {
      rawHtml = decoded;
    }
  } catch {
    // No era base64
  }

  // Si no era base64, verificar si es HTML plano
  if (
    !rawHtml &&
    candidate.includes("<") &&
    (candidate.includes("<html") ||
      candidate.includes("<!DOCTYPE") ||
      candidate.includes("<body") ||
      candidate.includes("<div"))
  ) {
    rawHtml = candidate;
  }
}

// Plantilla de demostración y respaldo seguro ZYRVAE
function getFallbackTemplate(title, dur, color) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1080, height=1920" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body, html { width: 1080px; height: 1920px; overflow: hidden; background-color: #09090b; color: #fafafa; }
    #root { position: relative; width: 1080px; height: 1920px; display: flex; flex-direction: column; justify-content: space-between; padding: 120px 80px; background: radial-gradient(circle at 50% 30%, #1e1b4b 0%, #09090b 70%); }
    .badge { display: inline-flex; align-items: center; gap: 14px; padding: 14px 28px; border-radius: 9999px; background: rgba(24, 24, 27, 0.85); border: 1px solid rgba(255, 255, 255, 0.15); width: fit-content; }
    .badge-dot { width: 14px; height: 14px; border-radius: 50%; background-color: ${color}; box-shadow: 0 0 16px ${color}; }
    .badge-text { font-size: 24px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #e4e4e7; }
    .content { display: flex; flex-direction: column; gap: 32px; margin: auto 0; }
    .accent { width: 120px; height: 8px; border-radius: 4px; background: ${color}; box-shadow: 0 0 24px ${color}; }
    .title { font-size: 80px; font-weight: 800; line-height: 1.08; letter-spacing: -0.04em; color: #ffffff; }
    .desc { font-size: 36px; line-height: 1.4; color: #a1a1aa; max-width: 900px; }
    .footer { display: flex; flex-direction: column; gap: 20px; }
    .progress-track { width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; width: 0%; background: ${color}; box-shadow: 0 0 16px ${color}; animation: progressAnim ${dur}s linear forwards; }
    @keyframes progressAnim { from { width: 0%; } to { width: 100%; } }
    .labels { display: flex; justify-content: space-between; font-size: 22px; color: #71717a; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
  </style>
</head>
<body data-composition-id="main" data-duration="${dur}" data-width="1080" data-height="1920" data-fps="30" data-no-timeline>
  <div id="root">
    <div class="badge">
      <span class="badge-dot"></span>
      <span class="badge-text">ZYRVAE MEDIA STUDIO</span>
    </div>
    <div class="content">
      <div class="accent"></div>
      <h1 class="title">${title}</h1>
      <p class="desc">Convertidor de HTML a Video publicitario ultra HD 9:16 impulsado por HyperFrames.</p>
    </div>
    <div class="footer">
      <div class="progress-track"><div class="progress-fill"></div></div>
      <div class="labels"><span>Renderizado HyperFrames</span><span>Ultra HD 9:16</span></div>
    </div>
  </div>
</body>
</html>`;
}

if (!rawHtml) {
  console.log("No se proporcionó HTML específico. Usando plantilla de demostración ZYRVAE.");
  rawHtml = getFallbackTemplate(rawTitle, duration, accentColor);
}

// 3. Preparar HTML para compatibilidad óptima con HyperFrames
function prepareCompositionHtml(htmlString, targetDuration) {
  let html = (htmlString || "").trim();
  const lower = html.toLowerCase();

  // Si es un fragmento sin etiquetas html/body, envolver en un documento HTML5 estándar
  const isFragment = !lower.includes("<html") && !lower.includes("<!doctype") && !lower.includes("<body");
  if (isFragment) {
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
<body data-composition-id="main" data-duration="${targetDuration}" data-width="1080" data-height="1920" data-fps="30" data-no-timeline>
  ${html}
</body>
</html>`;
    return html;
  }

  // Asegurar etiqueta charset
  if (!html.toLowerCase().includes("charset")) {
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head([^>]*)>/i, '<head$1>\n  <meta charset="UTF-8">');
    }
  }

  // Asegurar estilos base 1080x1920 para formato vertical
  if (!html.includes("1080px") && !html.includes("1080")) {
    const baseStyle = `\n  <style>\n    html, body { width: 1080px; height: 1920px; margin: 0; padding: 0; overflow: hidden; }\n  </style>\n`;
    if (/<head[^>]*>/i.test(html)) {
      html = html.replace(/<head([^>]*)>/i, `<head$1>${baseStyle}`);
    }
  }

  const hasTimelines = html.includes("window.__timelines");
  const hasCompositionId = /data-composition-id=/i.test(html);
  const hasNoTimeline = /data-no-timeline/i.test(html);

  if (!hasCompositionId) {
    // Si no tiene data-composition-id en ningún elemento, agregarlo al <body>
    if (/<body[^>]*>/i.test(html)) {
      html = html.replace(/<body([^>]*)>/i, (match, attrs) => {
        let newAttrs = attrs || "";
        newAttrs += ` data-composition-id="main"`;
        newAttrs += ` data-duration="${targetDuration}"`;
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
    // Si ya tiene data-composition-id en algún elemento
    // 1. Garantizar data-duration exacto y acotado
    if (/data-duration=["'][^"']*["']/i.test(html)) {
      html = html.replace(/data-duration=["']([^"']*)["']/i, `data-duration="${targetDuration}"`);
    } else {
      // Agregar data-duration si faltaba
      html = html.replace(/(data-composition-id=["'][^"']+["'])/i, `$1 data-duration="${targetDuration}"`);
    }

    // 2. Garantizar dimensiones verticales
    if (!/data-width=["'][^"']*["']/i.test(html)) {
      html = html.replace(/(data-composition-id=["'][^"']+["'])/i, `$1 data-width="1080" data-height="1920" data-fps="30"`);
    }

    // 3. Garantizar data-no-timeline si no usa window.__timelines para evitar timeouts
    if (!hasTimelines && !hasNoTimeline) {
      html = html.replace(/(data-composition-id=["'][^"']+["'])/i, `$1 data-no-timeline`);
    }
  }

  return html;
}

const finalHtml = prepareCompositionHtml(rawHtml, duration);

console.log("=== INICIANDO MOTOR DE RENDERIZADO HYPERFRAMES (CONVERTIDOR HTML -> VIDEO) ===");
console.log(`Título: "${rawTitle}"`);
console.log(`Duración acotada: ${duration}s`);
console.log(`Color de acento: ${accentColor}`);
console.log(`Tamaño HTML recibido: ${(Buffer.byteLength(finalHtml, "utf-8") / 1024).toFixed(1)} KB`);
console.log(`Destino MP4: ${outputMp4}`);

// 4. Pre-verificación de dependencias y optimizaciones de navegador
try {
  console.log("Comprobando aceleración de navegador HyperFrames (chrome-headless-shell)...");
  execSync("npx hyperframes browser ensure", { stdio: "inherit" });
} catch (bErr) {
  console.warn("Aviso: usando motor de navegador estándar:", bErr.message);
}

// Asegurar que googleapis esté disponible para el paso posterior de subida a Drive
try {
  import.meta.resolve("googleapis");
} catch {
  console.log("Preparando dependencias adicionales necesarias para la exportación...");
  try {
    execSync("npm i googleapis --no-save --no-audit --no-fund", { stdio: "ignore" });
  } catch {
    // ignore
  }
}

// 5. Directorio de composición
const compDir = path.join(process.cwd(), ".render-comp");
if (fs.existsSync(compDir)) {
  fs.rmSync(compDir, { recursive: true, force: true });
}
fs.mkdirSync(compDir, { recursive: true });

// Crear hyperframes.json
const hfConfig = {
  $schema: "https://hyperframes.heygen.com/schema/hyperframes.json",
};
fs.writeFileSync(path.join(compDir, "hyperframes.json"), JSON.stringify(hfConfig, null, 2));

// Escribir index.html
fs.writeFileSync(path.join(compDir, "index.html"), finalHtml, "utf-8");

console.log("Composición creada exitosamente en:", compDir);
console.log("Iniciando renderizado con HyperFrames (calidad estándar, 30fps)...");

// Función de ejecución del render
function runRender() {
  execSync(
    `npx hyperframes render "${compDir}" -o "${outputMp4}" --quality standard --low-memory-mode --no-browser-gpu --fps 30 --player-ready-timeout 15000`,
    {
      stdio: "inherit",
    }
  );
}

// 6. Ejecución del renderizador HyperFrames con auto-recuperación
try {
  try {
    runRender();
  } catch (renderError) {
    console.error("\n❌ Error durante el renderizado con el código HTML proporcionado:", renderError.message);

    // Si falló con HTML personalizado, intentar auto-recuperación con la plantilla de respaldo ZYRVAE
    console.log("\nIntentando recuperación automática con plantilla publicitaria segura ZYRVAE...");
    const safeHtml = getFallbackTemplate(rawTitle, duration, accentColor);
    fs.writeFileSync(path.join(compDir, "index.html"), safeHtml, "utf-8");

    runRender();
    console.log("✓ Recuperación exitosa: Video generado con plantilla de respaldo segura.");
  }

  if (!fs.existsSync(outputMp4) || fs.statSync(outputMp4).size === 0) {
    throw new Error("El archivo de video generado no existe o está vacío.");
  }

  const stats = fs.statSync(outputMp4);
  console.log(`\n🎉 ¡Video renderizado con éxito! Archivo: ${outputMp4} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
} finally {
  try {
    fs.rmSync(compDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
}
