import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";

const filePath = process.env.VIDEO_OUTPUT || path.join(process.cwd(), "output.mp4");
const rawTitle = process.env.VIDEO_TITLE || "Comercial ZYRVAE";

// Sanitize filename for Google Drive
const sanitizedTitle = rawTitle.replace(/[/\\?%*:|"<>]/g, "_").trim();
const fileName = `${sanitizedTitle}.mp4`;

console.log("=== SUBIENDO VIDEO A GOOGLE DRIVE ===");
console.log(`Archivo local: ${filePath}`);
console.log(`Nombre en Drive: ${fileName}`);

if (!fs.existsSync(filePath)) {
  console.error(`Error: El archivo de video "${filePath}" no existe.`);
  process.exit(1);
}

const stats = fs.statSync(filePath);
console.log(`Tamaño del archivo: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

// 1. Resolver Credenciales de Google (soporta múltiples formatos y aliases)
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
    // Si apunta a un archivo existente en disco
    if (fs.existsSync(rawContent)) {
      rawContent = fs.readFileSync(rawContent, "utf-8");
    }
    const parsed = JSON.parse(rawContent);
    clientEmail = parsed.client_email || clientEmail;
    privateKey = parsed.private_key || privateKey;
    console.log("Credenciales extraídas correctamente de JSON de Cuenta de Servicio.");
  } catch (err) {
    console.warn("No se pudo parsear el JSON de la cuenta de servicio:", err.message);
  }
}

// Limpiar comillas en clientEmail
if (clientEmail) {
  clientEmail = clientEmail.replace(/^["']|["']$/g, "").trim();
}

// 2. Limpiar y normalizar la clave privada
function formatPrivateKey(rawKey) {
  if (!rawKey) return "";
  let key = rawKey.trim();
  // Quitar comillas envolventes si las tiene
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  // Convertir secuencias literales '\n' a saltos de línea reales
  key = key.replace(/\\n/g, "\n");
  return key;
}

const formattedPrivateKey = formatPrivateKey(privateKey);

// 3. Verificar si existen credenciales válidas
if (!clientEmail || !formattedPrivateKey) {
  console.error("\n======================================================================");
  console.error("❌ ERROR: FALTAN CREDENCIALES DE GOOGLE DRIVE EN GITHUB ACTIONS");
  console.error("======================================================================");
  console.error("No se encontraron GOOGLE_CLIENT_EMAIL ni GOOGLE_PRIVATE_KEY válidos.");
  console.error("Recuerda que GitHub Actions NO tiene acceso a las variables de Vercel.");
  console.error("Debes configurar estos secretos en el repositorio de GitHub:\n");
  console.error("1. Ve a: Settings > Secrets and variables > Actions");
  console.error("2. Agrega los 'Repository secrets':");
  console.error("   - GOOGLE_CLIENT_EMAIL (ej: xxx@tu-proyecto.iam.gserviceaccount.com)");
  console.error("   - GOOGLE_PRIVATE_KEY (clave privada completa con -----BEGIN PRIVATE KEY-----)");
  console.error("   - GOOGLE_DRIVE_FOLDER_ID (ID de la carpeta destino de Drive)");
  console.error("======================================================================\n");
  process.exit(1);
}

// 4. Limpiar ID de carpeta destino (soporta ID directo o URL completa de Drive)
let folderId = (process.env.GOOGLE_DRIVE_FOLDER_ID || "").trim().replace(/^["']|["']$/g, "");
if (folderId.includes("drive.google.com")) {
  const match = folderId.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (match) {
    folderId = match[1];
    console.log(`ID de carpeta extraído de URL de Drive: ${folderId}`);
  }
}

if (!folderId) {
  console.warn("Advertencia: GOOGLE_DRIVE_FOLDER_ID no está definido. El video se subirá a la raíz de la cuenta de servicio.");
} else {
  console.log(`Carpeta destino en Drive: ${folderId}`);
}

async function upload() {
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
      // Si falló por 404 (carpeta no compartida o inexistente)
      const is404 = uploadErr?.status === 404 || uploadErr?.code === 404 || uploadErr?.message?.includes("File not found");
      const is403 = uploadErr?.status === 403 || uploadErr?.code === 403 || uploadErr?.message?.includes("permission");

      if (uploadParents && (is404 || is403)) {
        console.error("\n=======================================================");
        console.error("⚠️  AVISO DE PERMISOS EN CARPETA DE GOOGLE DRIVE:");
        console.error(`La carpeta "${folderId}" dio error (${uploadErr.message}).`);
        console.error(`Para solucionarlo:`);
        console.error(`1. Abre tu Google Drive en el navegador.`);
        console.error(`2. Haz clic derecho en tu carpeta -> Compartir.`);
        console.error(`3. Invita al correo de tu Cuenta de Servicio: ${clientEmail}`);
        console.error(`4. Asígnale permiso de 'Editor'.`);
        console.error("Subiendo a la raíz de la cuenta para no perder el video...");
        console.error("=======================================================\n");

        // Fallback: subir a la raíz para salvar el archivo
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

    const fileId = response.data.id;
    console.log("¡Video subido exitosamente a Google Drive!");
    console.log(`ID del archivo: ${fileId}`);
    console.log(`Nombre: ${response.data.name}`);
    console.log(`Enlace de visualización: ${response.data.webViewLink || "N/A"}`);

    // Configurar permisos públicos para que cualquier persona con el enlace pueda verlo/descargarlo
    try {
      await drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
        supportsAllDrives: true,
      });
      console.log("Permisos públicos de lectura configurados correctamente.");
    } catch (permErr) {
      console.warn("Aviso: No se pudo configurar permiso 'anyone' (política de Workspace restrictiva):", permErr.message);
    }

    // Escribir en GITHUB_STEP_SUMMARY si estamos en GitHub Actions
    if (process.env.GITHUB_STEP_SUMMARY) {
      try {
        const summary = `
### 🎬 Video Renderizado y Subido a Google Drive

| Propiedad | Detalle |
| :--- | :--- |
| **Título** | \`${fileName}\` |
| **Tamaño** | ${(stats.size / 1024 / 1024).toFixed(2)} MB |
| **ID en Drive** | \`${fileId}\` |
| **Carpeta Destino** | ${folderId ? `\`${folderId}\`` : "_Raíz de la Cuenta_"} |
| **Enlace Drive** | [Abrir en Google Drive](${response.data.webViewLink || "#"}) |
`;
        fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary, "utf-8");
      } catch (sumErr) {
        // ignore
      }
    }
  } catch (error) {
    console.error("\n=======================================================");
    console.error("ERROR AL SUBIR A GOOGLE DRIVE:", error.message || error);
    if (error.errors) {
      console.error("Detalles de Google API:", JSON.stringify(error.errors, null, 2));
    }
    console.error("=======================================================\n");
    process.exit(1);
  }
}

upload();
