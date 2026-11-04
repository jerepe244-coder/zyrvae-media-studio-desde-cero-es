import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const title = process.env.VIDEO_TITLE || "Comercial ZYRVAE";
const text = process.env.VIDEO_TEXT || "Potencia tu marca con video de alta conversión";
const color = process.env.VIDEO_COLOR || "#6366f1";
const outputMp4 = process.env.VIDEO_OUTPUT || path.join(process.cwd(), "output.mp4");

console.log("=== INICIANDO MOTOR DE RENDERIZADO HYPERFRAMES ===");
console.log(`Título: "${title}"`);
console.log(`Texto: "${text}"`);
console.log(`Color de acento: "${color}"`);
console.log(`Destino: ${outputMp4}`);

const compDir = path.join(process.cwd(), ".render-comp");
if (fs.existsSync(compDir)) {
  fs.rmSync(compDir, { recursive: true, force: true });
}
fs.mkdirSync(compDir, { recursive: true });

// 1. hyperframes.json
const hfConfig = {
  $schema: "https://hyperframes.heygen.com/schema/hyperframes.json"
};
fs.writeFileSync(path.join(compDir, "hyperframes.json"), JSON.stringify(hfConfig, null, 2));

// Helper to escape HTML
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const safeTitle = escapeHtml(title);
const safeText = escapeHtml(text);
const safeColor = color.match(/^#[0-9a-fA-F]{3,8}$/) ? color : "#6366f1";

// 2. index.html with GSAP animation (1080x1920 portrait - 5s duration)
const htmlContent = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=1080, height=1920" />
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    body, html {
      width: 1080px;
      height: 1920px;
      overflow: hidden;
      background-color: #09090b;
      color: #fafafa;
    }
    #root {
      position: relative;
      width: 1080px;
      height: 1920px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 120px 80px;
      background-color: #09090b;
      overflow: hidden;
    }
    /* Grid background */
    .grid-bg {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 60px 60px;
      z-index: 1;
    }
    /* Ambient glow */
    .glow-sphere {
      position: absolute;
      top: 35%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, ${safeColor} 0%, transparent 70%);
      opacity: 0.25;
      filter: blur(80px);
      border-radius: 50%;
      z-index: 2;
    }
    .content-wrap {
      position: relative;
      z-index: 10;
    }
    /* Header / Badge */
    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 14px 28px;
      border-radius: 9999px;
      background: rgba(24, 24, 27, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(12px);
    }
    .badge-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background-color: ${safeColor};
      box-shadow: 0 0 16px ${safeColor};
    }
    .badge-text {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #e4e4e7;
    }
    /* Center text */
    .center-content {
      position: relative;
      z-index: 10;
      margin: auto 0;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .accent-bar {
      width: 120px;
      height: 8px;
      border-radius: 4px;
      background-color: ${safeColor};
      box-shadow: 0 0 20px ${safeColor};
    }
    .main-title {
      font-size: 80px;
      font-weight: 800;
      line-height: 1.08;
      letter-spacing: -0.04em;
      color: #ffffff;
      text-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
    }
    .sub-text {
      font-size: 36px;
      font-weight: 400;
      line-height: 1.4;
      color: #a1a1aa;
      max-width: 900px;
    }
    /* Footer */
    .footer-bar {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .progress-track {
      width: 100%;
      height: 6px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      width: 0%;
      background: ${safeColor};
      box-shadow: 0 0 12px ${safeColor};
    }
    .footer-labels {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 22px;
      color: #71717a;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div id="root" data-composition-id="main" data-start="0" data-duration="5" data-width="1080" data-height="1920" data-fps="30">
    <div class="grid-bg"></div>
    <div id="glow" class="glow-sphere"></div>

    <!-- Header -->
    <div class="content-wrap">
      <div id="badge" class="header-badge">
        <span class="badge-dot"></span>
        <span class="badge-text">ZYRVAE STUDIO</span>
      </div>
    </div>

    <!-- Center Content -->
    <div class="center-content">
      <div id="accent" class="accent-bar"></div>
      <h1 id="title" class="main-title">${safeTitle}</h1>
      <p id="desc" class="sub-text">${safeText}</p>
    </div>

    <!-- Footer -->
    <div class="footer-bar">
      <div class="progress-track">
        <div id="progress" class="progress-fill"></div>
      </div>
      <div class="footer-labels">
        <span>Renderizado HyperFrames</span>
        <span>Ultra HD 9:16</span>
      </div>
    </div>
  </div>

  <script>
    const tl = gsap.timeline({ paused: true });

    // GSAP Animation Sequence
    tl.fromTo("#badge", { opacity: 0, y: -40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }, 0.2);
    tl.fromTo("#glow", { opacity: 0.1, scale: 0.8 }, { opacity: 0.35, scale: 1.2, duration: 2.5, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0);
    tl.fromTo("#accent", { width: 0, opacity: 0 }, { width: 140, opacity: 1, duration: 0.7, ease: "power2.out" }, 0.5);
    tl.fromTo("#title", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.0, ease: "power4.out" }, 0.7);
    tl.fromTo("#desc", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 1.1);
    tl.fromTo("#progress", { width: "0%" }, { width: "100%", duration: 5, ease: "none" }, 0);

    window.__timelines = window.__timelines || {};
    window.__timelines["main"] = tl;
    tl.seek(0);
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(compDir, "index.html"), htmlContent);

console.log("Composición creada exitosamente en:", compDir);
console.log("Ejecutando HyperFrames render...");

try {
  execSync(`npx hyperframes render "${compDir}" -o "${outputMp4}" --no-browser-gpu --quality looks --fps 30`, {
    stdio: "inherit"
  });

  if (!fs.existsSync(outputMp4) || fs.statSync(outputMp4).size === 0) {
    throw new Error("El archivo de video generado no existe o está vacío.");
  }

  const stats = fs.statSync(outputMp4);
  console.log(`Video renderizado con éxito: ${outputMp4} (${(stats.size / 1024).toFixed(1)} KB)`);
} finally {
  try {
    fs.rmSync(compDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
}
