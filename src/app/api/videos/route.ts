import { NextResponse, connection } from "next/server"
import { drive, isGoogleDriveConfigured, getCleanFolderId } from "@/lib/google"

export const dynamic = "force-dynamic"

function formatDate(createdTime?: string | null): string {
  if (!createdTime) return "Fecha no disponible"
  try {
    const date = new Date(createdTime)
    const now = new Date()
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()

    if (isToday) {
      return `Hoy, ${date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    }

    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  } catch {
    return createdTime
  }
}

export async function GET() {
  await connection()
  try {
    const configured = isGoogleDriveConfigured()
    const folderId = getCleanFolderId()

    if (!configured) {
      return NextResponse.json({
        configured: false,
        folderConfigured: Boolean(folderId),
        videos: [],
        message:
          "Las credenciales de Google Drive no están configuradas en las variables de entorno (GOOGLE_CLIENT_EMAIL y GOOGLE_PRIVATE_KEY). Puedes usar la opción de guardado manual en tu dispositivo.",
      })
    }

    // Si hay folderId, buscar dentro de la carpeta; si no, buscar videos en la raíz
    let q = "mimeType contains 'video/' and trashed = false"
    if (folderId) {
      q = `'${folderId}' in parents and mimeType contains 'video/' and trashed = false`
    }

    // Ejecutar con timeout de seguridad de 3.5s para evitar que bloquee la carga de la página
    const drivePromise = drive.files.list({
      q,
      fields: "files(id, name, createdTime, webViewLink, webContentLink, thumbnailLink)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      orderBy: "createdTime desc",
      pageSize: 50,
    })

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout de conexión con Google Drive API")), 3500)
    )

    type DriveFileItem = {
      id?: string | null;
      name?: string | null;
      createdTime?: string | null;
      webViewLink?: string | null;
      webContentLink?: string | null;
      thumbnailLink?: string | null;
    };

    const response = (await Promise.race([drivePromise, timeoutPromise])) as {
      data?: { files?: DriveFileItem[] };
    };

    const files = response?.data?.files || [];
    const videos = files.map((file) => ({
      id: file.id || "",
      title: file.name ? file.name.replace(/\.mp4$/i, "") : "Video sin título",
      driveLink: file.webViewLink || "",
      downloadLink:
        file.webContentLink ||
        (file.id ? `https://drive.google.com/uc?export=download&id=${file.id}` : ""),
      thumbnail: file.thumbnailLink || null,
      date: formatDate(file.createdTime),
    }));

    return NextResponse.json(
      {
        configured: true,
        folderConfigured: Boolean(folderId),
        folderId: folderId || null,
        videos,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    )
  } catch (error) {
    console.error("Error al obtener videos de Google Drive:", error)
    return NextResponse.json(
      {
        error: "Error al obtener videos de Google Drive",
        details: error instanceof Error ? error.message : String(error),
        videos: [],
        configured: isGoogleDriveConfigured(),
      },
      { status: 500 }
    )
  }
}
