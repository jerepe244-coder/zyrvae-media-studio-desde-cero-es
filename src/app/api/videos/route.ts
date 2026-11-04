import { NextResponse, connection } from "next/server"
import { drive } from "@/lib/google"

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
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
    if (!folderId) {
      console.warn("GOOGLE_DRIVE_FOLDER_ID no está configurada")
      return NextResponse.json([])
    }

    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'video/' and trashed = false`,
      fields: "files(id, name, createdTime, webViewLink, thumbnailLink)",
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    })

    const files = response.data.files || []
    const videos = files.map((file) => ({
      id: file.id || "",
      title: file.name ? file.name.replace(/\.mp4$/i, "") : "Video sin título",
      driveLink: file.webViewLink || "",
      thumbnail: file.thumbnailLink || null,
      date: formatDate(file.createdTime),
    }))

    return NextResponse.json(videos)
  } catch (error) {
    console.error("Error al obtener videos de Google Drive:", error)
    return NextResponse.json(
      { error: "Error al obtener videos de Google Drive", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
