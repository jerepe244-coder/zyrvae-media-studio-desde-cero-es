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

// 2. Extraer propiedades de video para Remotion
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

// Intentar leer props desde VIDEO_TEXT (Base64 JSON o JSON plano)
if (process.env.VIDEO_TEXT && process.env.VIDEO_TEXT.trim()) {
  const candidate = process.env.VIDEO_TEXT.trim();

  // A. Decodificar desde Base64
  try {
    const decoded = Buffer.from(candidate, "base64").toString("utf-8");
    if (decoded.trim().startsWith("{")) {
      const parsed = JSON.parse(decoded);
      remotionProps = { ...remotionProps, ...parsed };
    }
  } catch {
    // no es base64
  }

  // B. Parsear como JSON directo si aplica
  if (candidate.startsWith("{")) {
    try {
      const parsed = JSON.parse(candidate);
      remotionProps = { ...remotionProps, ...parsed };
    } catch {
      // no es JSON plano
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

const durationInFrames = Math.max(30, Math.min(3600, duration * 30));

console.log("=== INICIANDO MOTOR DE RENDERIZADO REMOTION (ZYRVAE MEDIA STUDIO) ===");
console.log(`Título: "${remotionProps.title}"`);
console.log(`Duración: ${duration}s (${durationInFrames} frames a 30fps)`);
console.log(`Color de acento: ${accentColor}`);
console.log(`Destino MP4: ${outputMp4}`);

// Asegurar dependencias adicionales para subida a Drive si faltasen
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

// 3. Crear archivo temporal de props para Remotion
const propsPath = path.join(process.cwd(), ".remotion-props.json");
fs.writeFileSync(propsPath, JSON.stringify(remotionProps, null, 2), "utf-8");

// 4. Renderizado con Remotion CLI
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
    throw new Error("El archivo de video generado no existe o está vacío.");
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
