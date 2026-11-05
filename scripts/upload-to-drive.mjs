import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";

const filePath = process.env.VIDEO_OUTPUT || path.join(process.cwd(), "output.mp4");
const rawTitle = process.env.VIDEO_TITLE || "Comercial ZYRVAE";

// Sanitize filename for Google Drive and local downloads
const sanitizedTitle = rawTitle.replace(/[/\\?%*:|"<>]/g, "_").trim();
const fileName = `${sanitizedTitle}.mp4`;

console.log("=== PROCESANDO DESTINO DE GUARDADO DEL VIDEO ===");
console.log(`Archivo local generado: ${filePath}`);
console.log(`Nombre de exportación: ${fileName}`);

if (!fs.existsSync(filePath)) {
  console.error(`Error: El archivo de video "${filePath}" no fue generado.`);
  process.exit(1);
}

const stats = fs.statSync(filePath);
console.log(`Tamaño del archivo: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

// Helper para subir a enlace de descarga directa en caso de modo manual / sin Drive
async function uploadForDirectDownload(localPath, outputName) {
  try {
    console.log("Generando enlace de descarga directa para almacenamiento local...");
    const formData = new FormData();
    const fileBlob = new Blob([fs.readFileSync(localPath)], { type: "video/mp4" });
    formData.append("file", fileBlob, outputName);

    const res = await fetch("https://tmpfiles.org/api/v1/upload", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.data?.url) {
        const viewUrl = json.data.url;
        const dlUrl = viewUrl.replace("https://tmpfiles.org/", "https://tmpfiles.org/dl/");
        return { viewUrl, dlUrl };
      }
    }
  } catch (err) {
    console.warn("Aviso: No se pudo generar enlace temporal de descarga directa:", err.message);
  }
  return null;
}

// 1. Resolver Credenciales de Google (soporta múltiples formatos)
let clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim();
let privateKey = process.env.GOOGLE_PRIVATE_KEY?.trim();

const serviceAccountRaw =
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
  process.env.GOOGLE_CREDENTIALS ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.GCP_SA_KEY;

if (serviceAccountRaw) {
  try {
    let rawContent = serviceAccountRaw.trim();
    if (fs.existsSync && fs.existsSync(rawContent)) {
      rawContent = fs.readFileSync(rawContent, "utf-8");
    }
    const parsed = JSON.parse(rawContent);
    clientEmail = parsed.client_email || clientEmail;
    privateKey = parsed.private_key || privateKey;
  } catch (err) {
    console.warn("No se pudo parsear el JSON de la cuenta de servicio:", err.message);
  }
}

if (clientEmail) {
  clientEmail = clientEmail.replace(/^["']|["']$/g, "").trim();
}

function formatPrivateKey(rawKey) {
  if (!rawKey) return "";
  let key = rawKey.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\\n/g, "\n");
  return key;
}

const formattedPrivateKey = formatPrivateKey(privateKey);
const hasGoogleCreds = Boolean(clientEmail && formattedPrivateKey);

// 2. Limpiar ID de carpeta destino
let folderId = (process.env.GOOGLE_DRIVE_FOLDER_ID || "").trim().replace(/^["']|["']$/g, "");
if (folderId.includes("drive.google.com")) {
  const match = folderId.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (match) {
    folderId = match[1];
    console.log(`ID de carpeta extraído de URL de Drive: ${folderId}`);
  }
}

async function handleSave() {
  let directDownload = null;
  let driveUploaded = false;
  let driveData = null;

  // Paso A: Intentar subida a Google Drive si las credenciales están presentes
  if (hasGoogleCreds) {
    console.log("\nIntentando sincronización con Google Drive...");
    try {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: clientEmail,
          private_key: formattedPrivateKey,
        },
        scopes: [
          "https://www.googleapis.com/auth/drive",
          "https://www.googleapis.com/auth/drive.file",
        ],
      });

      const drive = google.drive({ version: "v3", auth });
      let uploadParents = folderId ? [folderId] : undefined;
      let response;

      try {
        response = await drive.files.create({
          requestBody: {
            name: fileName,
            parents: uploadParents,
          },
          media: {
            mimeType: "video/mp4",
            body: fs.createReadStream(filePath),
          },
          fields: "id, name, webViewLink, webContentLink, createdTime, parents",
          supportsAllDrives: true,
        });
      } catch (uploadErr) {
        const is404 = uploadErr?.status === 404 || uploadErr?.code === 404 || uploadErr?.message?.includes("File not found");
        const is403 = uploadErr?.status === 403 || uploadErr?.code === 403 || uploadErr?.message?.includes("permission");

        if (uploadParents && (is404 || is403)) {
          console.warn(`[AVISO]: La carpeta de Drive "${folderId}" no fue accesible. Guardando en la raíz de la cuenta de servicio...`);
          response = await drive.files.create({
            requestBody: {
              name: fileName,
            },
            media: {
              mimeType: "video/mp4",
              body: fs.createReadStream(filePath),
            },
            fields: "id, name, webViewLink, webContentLink, createdTime, parents",
            supportsAllDrives: true,
          });
        } else {
          throw uploadErr;
        }
      }

      driveUploaded = true;
      driveData = response.data;
      console.log("✓ ¡Video subido con éxito a Google Drive!");
      console.log(`  ID del archivo: ${driveData.id}`);
      console.log(`  Enlace de visualización: ${driveData.webViewLink || "N/A"}`);

      // Asignar permisos públicos para que sea accesible
      try {
        await drive.permissions.create({
          fileId: driveData.id,
          requestBody: {
            role: "reader",
            type: "anyone",
          },
          supportsAllDrives: true,
        });
        console.log("  Permisos públicos de lectura configurados.");
      } catch (permErr) {
        console.warn("  Aviso sobre permisos 'anyone':", permErr.message);
      }
    } catch (driveErr) {
      console.warn("No se pudo completar la subida automática a Google Drive:", driveErr.message || driveErr);
      console.log("Activando modo manual / descarga a tu dispositivo...");
    }
  } else {
    console.log("ℹ️ Modo manual / Almacenamiento en dispositivo activo (Sin credenciales de Drive en GitHub).");
  }

  // Paso B: Generar enlace directo para guardado manual en dispositivo
  directDownload = await uploadForDirectDownload(filePath, fileName);

  if (directDownload) {
    console.log("\n=======================================================");
    console.log("📥 ENLACE PARA DESCARGAR EL VIDEO A TU DISPOSITIVO:");
    console.log(directDownload.dlUrl || directDownload.viewUrl);
    console.log("=======================================================\n");
  }

  // Paso C: Escribir resumen en GitHub Actions Step Summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      let summary = `
### 🎬 Video Comercial Renderizado: \`${fileName}\`
**Tamaño:** ${(stats.size / 1024 / 1024).toFixed(2)} MB

#### 📥 Opción 1: Descargar en tu Dispositivo (Almacenamiento Local)
`;

      if (directDownload) {
        summary += `[▶ **Descargar Video .MP4 a tu Dispositivo**](${directDownload.dlUrl || directDownload.viewUrl})\n\n`;
      } else {
        summary += `_Puedes descargar el archivo \`output.mp4\` desde los artefactos de esta ejecución._\n\n`;
      }

      summary += `#### ☁️ Opción 2: Google Drive\n`;
      if (driveUploaded && driveData) {
        summary += `✓ **Guardado en Drive:** [Abrir en Google Drive](${driveData.webViewLink || "#"})\n\n`;
        summary += `*Tip:* Dentro de Google Drive puedes hacer clic en **"Añadir acceso directo a Mi unidad"** para guardarlo en tu cuenta personal.\n`;
      } else {
        summary += `_Para guardar en Drive manualmente, descarga el archivo en tu dispositivo y arrástralo a la carpeta de Google Drive que desees._\n`;
      }

      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary, "utf-8");
    } catch {
      // ignore
    }
  }

  console.log("¡Proceso completado exitosamente!");
}

handleSave();
