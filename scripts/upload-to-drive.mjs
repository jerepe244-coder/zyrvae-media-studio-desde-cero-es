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

// Resolve Google Credentials
let clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
let privateKey = process.env.GOOGLE_PRIVATE_KEY;

if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
  try {
    const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    clientEmail = parsed.client_email || clientEmail;
    privateKey = parsed.private_key || privateKey;
  } catch (err) {
    console.warn("No se pudo parsear GOOGLE_SERVICE_ACCOUNT_KEY como JSON, usando variables individuales:", err.message);
  }
}

if (!clientEmail || !privateKey) {
  console.error("Error: Faltan credenciales de Google (GOOGLE_CLIENT_EMAIL y/o GOOGLE_PRIVATE_KEY).");
  console.error("Asegúrate de configurar los secretos en el repositorio de GitHub.");
  process.exit(1);
}

// Clean and normalize private key
const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
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
        "https://www.googleapis.com/auth/drive.file"
      ],
    });

    const drive = google.drive({ version: "v3", auth });

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: folderId ? [folderId] : undefined,
      },
      media: {
        mimeType: "video/mp4",
        body: fs.createReadStream(filePath),
      },
      fields: "id, name, webViewLink, webContentLink, createdTime",
      supportsAllDrives: true,
    });

    console.log("¡Video subido exitosamente a Google Drive!");
    console.log(`ID del archivo: ${response.data.id}`);
    console.log(`Nombre: ${response.data.name}`);
    console.log(`Enlace de visualización: ${response.data.webViewLink || "N/A"}`);
  } catch (error) {
    console.error("Error al subir el video a Google Drive:", error);
    process.exit(1);
  }
}

upload();
