import { google } from "googleapis"
import fs from "node:fs"

let clientEmail = process.env.GOOGLE_CLIENT_EMAIL?.trim()
let privateKey = process.env.GOOGLE_PRIVATE_KEY?.trim()

// Soporte para JSON completo de Service Account
const serviceAccountRaw =
  process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
  process.env.GOOGLE_CREDENTIALS ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  process.env.GCP_SA_KEY

if (serviceAccountRaw) {
  try {
    let rawContent = serviceAccountRaw.trim()
    if (fs.existsSync && fs.existsSync(rawContent)) {
      rawContent = fs.readFileSync(rawContent, "utf-8")
    }
    const parsed = JSON.parse(rawContent)
    clientEmail = parsed.client_email || clientEmail
    privateKey = parsed.private_key || privateKey
  } catch (err) {
    console.warn("No se pudo parsear el JSON de la cuenta de servicio en google.ts:", err)
  }
}

if (clientEmail) {
  clientEmail = clientEmail.replace(/^["']|["']$/g, "").trim()
}

function cleanPrivateKey(rawKey?: string): string | undefined {
  if (!rawKey) return undefined
  let key = rawKey.trim()
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1)
  }
  return key.replace(/\\n/g, "\n")
}

const cleanedPrivateKey = cleanPrivateKey(privateKey)

export function isGoogleDriveConfigured(): boolean {
  return Boolean(clientEmail && cleanedPrivateKey)
}

export function getCleanFolderId(): string {
  let folderId = (process.env.GOOGLE_DRIVE_FOLDER_ID || "").trim()
  if (
    (folderId.startsWith('"') && folderId.endsWith('"')) ||
    (folderId.startsWith("'") && folderId.endsWith("'"))
  ) {
    folderId = folderId.slice(1, -1)
  }
  if (folderId.includes("drive.google.com")) {
    const match = folderId.match(/folders\/([a-zA-Z0-9_-]+)/)
    if (match) {
      folderId = match[1]
    }
  }
  return folderId
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: clientEmail,
    private_key: cleanedPrivateKey,
  },
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
})

export const drive = google.drive({ version: "v3", auth })

export default drive
