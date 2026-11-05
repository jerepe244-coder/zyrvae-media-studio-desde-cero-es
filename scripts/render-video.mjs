import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// 1. Obtener parámetros del entorno
const rawTitle = process.env.VIDEO_TITLE || "Comercial ZYRVAE";

// Duración: puede venir de VIDEO_DURATION o de VIDEO_COLOR (ej: "10s" o "15")
let durationInput = parseInt(process.env.VIDEO_DURATION || "", 10);
if (isNaN(durationInput) && process.env.VIDEO_COLOR) {
  const parsedFromColor = parseInt(process.env.VIDEO_COLOR.replace(/[^0-9]/g, ""), 10);
  if (!isNaN(parsedFromColor) && parsedFromColor > 0) {
    durationInput = parsedFromColor;
  }
}
const duration = isNaN(durationInput) || durationInput <= 0 ? 10 : durationInput;
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

// C. Desde VIDEO_TEXT (compatibilidad total con el workflow existente en main)
if (!rawHtml && process.env.VIDEO_TEXT && process.env.VIDEO_TEXT.trim()) {
  const candidate = process.env.VIDEO_TEXT.trim();
  // Probar si viene codificado en base64
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
    // No es base64 válido
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

// Plantilla de fallback si no se proporciona HTML
if (!rawHtml) {
  console.log("No se proporcionó HTML específico. Usando plantilla de demostración ZYRVAE.");
  rawHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1080, height=1920" />
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body, html { width: 1080px; height: 1920px; overflow: hidden; background-color: #09090b; color: #fafafa; }
    #root { position: relative; width: 1080px; height: 1920px; display: flex; flex-direction: column; justify-content: space-between; padding: 120px 80px; background: radial-gradient(circle at 50% 30%, #1e1b4b 0%, #09090b 70%); }
    .badge { display: inline-flex; align-items: center; gap: 12px; padding: 14px 28px; border-radius: 9999px; background: rgba(24, 24, 27, 0.85); border: 1px solid rgba(255, 255, 255, 0.15); width: fit-content; }
    .badge-dot { width: 14px; height: 14px; border-radius: 50%; background-color: #6366f1; box-shadow: 0 0 16px #6366f1; }
    .badge-text { font-size: 24px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #e4e4e7; }
    .content { display: flex; flex-direction: column; gap: 32px; margin: auto 0; }
    .accent { width: 120px; height: 8px; border-radius: 4px; background: #6366f1; box-shadow: 0 0 24px #6366f1; }
    .title { font-size: 80px; font-weight: 800; line-height: 1.08; letter-spacing: -0.04em; color: #ffffff; }
    .desc { font-size: 36px; line-height: 1.4; color: #a1a1aa; max-width: 900px; }
    .footer { display: flex; flex-direction: column; gap: 20px; }
    .progress-track { width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; width: 0%; background: #6366f1; box-shadow: 0 0 16px #6366f1; }
    .labels { display: flex; justify-content: space-between; font-size: 22px; color: #71717a; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; }
  </style>
</head>
<body data-composition-id="main" data-duration="10" data-width="1080" data-height="1920" data-fps="30">
  <div id="root">
    <div class="badge">
      <span class="badge-dot"></span>
      <span class="badge-text">ZYRVAE MEDIA STUDIO</span>
    </div>
    <div class="content">
      <div class="accent"></div>
      <h1 class="title">${rawTitle}</h1>
      <p class="desc">Convertidor de HTML a Video publicitario ultra HD 9:16 impulsado por HyperFrames.</p>
    </div>
    <div class="footer">
      <div class="progress-track"><div id="progress" class="progress-fill"></div></div>
      <div class="labels"><span>Renderizado HyperFrames</span><span>Ultra HD 9:16</span></div>
    </div>
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.to("#progress", { width: "100%", duration: 10, ease: "none" }, 0);
    window.__timelines = { main: tl };
  </script>
</body>
</html>`;
}

// 3. Preparar HTML para compatibilidad óptima con HyperFrames
function prepareCompositionHtml(htmlString, targetDuration) {
  let html = htmlString.trim();

  // Si es un fragmento sin etiquetas html básicas, envolverlo
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

  // Asegurar etiqueta charset
  if (!html.toLowerCase().includes("charset")) {
    html = html.replace(/<head([^>]*)>/i, '<head$1>\n  <meta charset="UTF-8">');
  }

  const hasTimelines = html.includes("window.__timelines");
  const hasCompositionId = html.includes("data-composition-id");
  const hasDuration = html.includes("data-duration");
  const hasNoTimeline = html.includes("data-no-timeline");

  // Si no tiene data-composition-id en ningún elemento, agregarlo al <body>
  if (!hasCompositionId) {
    if (html.toLowerCase().includes("<body")) {
      html = html.replace(/<body([^>]*)>/i, (match, attrs) => {
        let newAttrs = attrs;
        newAttrs += ` data-composition-id="main"`;
        if (!hasDuration) {
          newAttrs += ` data-duration="${targetDuration}"`;
        }
        newAttrs += ` data-width="1080" data-height="1920" data-fps="30"`;
        if (!hasTimelines && !hasNoTimeline) {
          // Evita esperar el timeout de 45 segundos de timelines si no se usa window.__timelines
          newAttrs += ` data-no-timeline`;
        }
        return `<body${newAttrs}>`;
      });
    }
  } else if (!hasTimelines && !hasNoTimeline) {
    // Si tiene data-composition-id pero no tiene timeline ni data-no-timeline
    html = html.replace(/(data-composition-id=["'][^"']+["'])/i, `$1 data-no-timeline`);
  }

  return html;
}

const finalHtml = prepareCompositionHtml(rawHtml, duration);

console.log("=== INICIANDO MOTOR DE RENDERIZADO HYPERFRAMES (CONVERTIDOR HTML -> VIDEO) ===");
console.log(`Título: "${rawTitle}"`);
console.log(`Duración: ${duration}s`);
console.log(`Tamaño HTML recibido: ${(Buffer.byteLength(finalHtml, 'utf-8') / 1024).toFixed(1)} KB`);
console.log(`Destino MP4: ${outputMp4}`);

// 4. Directorio de composición
const compDir = path.join(process.cwd(), ".render-comp");
if (fs.existsSync(compDir)) {
  fs.rmSync(compDir, { recursive: true, force: true });
}
fs.mkdirSync(compDir, { recursive: true });

// Crear hyperframes.json
const hfConfig = {
  $schema: "https://hyperframes.heygen.com/schema/hyperframes.json"
};
fs.writeFileSync(path.join(compDir, "hyperframes.json"), JSON.stringify(hfConfig, null, 2));

// Escribir index.html
fs.writeFileSync(path.join(compDir, "index.html"), finalHtml, "utf-8");

console.log("Composición creada exitosamente en:", compDir);
console.log("Ejecutando HyperFrames render...");

// 5. Ejecución del renderizador HyperFrames
try {
  execSync(
    `npx hyperframes render "${compDir}" -o "${outputMp4}" --no-browser-gpu --quality looks --fps 30`,
    {
      stdio: "inherit",
    }
  );

  if (!fs.existsSync(outputMp4) || fs.statSync(outputMp4).size === 0) {
    throw new Error("El archivo de video generado no existe o está vacío.");
  }

  const stats = fs.statSync(outputMp4);
  console.log(`¡Video renderizado con éxito! Archivo: ${outputMp4} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
} finally {
  try {
    fs.rmSync(compDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
}
