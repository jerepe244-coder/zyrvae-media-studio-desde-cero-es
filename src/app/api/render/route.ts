import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const rawToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
    const token = rawToken.trim();

    const body = await request.json().catch(() => ({}));
    const { title, html, html_code, duration } = body || {};

    const rawHtmlContent = (html || html_code || "").trim();

    if (!rawHtmlContent) {
      return NextResponse.json(
        {
          error: "Código HTML requerido",
          details: "Debes subir un archivo .html o pegar el código HTML del anuncio para convertirlo a video.",
        },
        { status: 400 }
      );
    }

    // Convertir el HTML a Base64 para pasarlo de manera limpia y segura a GitHub Actions
    const base64Html = Buffer.from(rawHtmlContent, "utf-8").toString("base64");

    // Límite de payload de GitHub Actions workflow_dispatch es de ~65,535 caracteres
    if (base64Html.length > 62000) {
      const sizeKb = (Buffer.byteLength(rawHtmlContent, "utf-8") / 1024).toFixed(1);
      return NextResponse.json(
        {
          error: "Tamaño HTML excedido",
          details: `El código HTML pesa ${sizeKb} KB. El límite máximo admitido por GitHub Actions es de ~45-50 KB sin comprimir. Si incluye imágenes incrustadas en Base64, reemplázalas por URLs web públicas directas.`,
        },
        { status: 413 }
      );
    }

    const videoTitle = (title && String(title).trim()) || "Comercial ZYRVAE";
    const videoDuration = duration ? String(duration).replace(/[^0-9]/g, "") || "10" : "10";

    const githubUrl =
      "https://api.github.com/repos/jerepe244-coder/zyrvae-media-studio-desde-cero-es/actions/workflows/render-video.yml/dispatches";

    // Enviamos el HTML base64 en inputs.text y la duracion en inputs.color
    // Esto es 100% compatible con el workflow existente en main sin requerir permisos de 'workflow'
    const payload = {
      ref: "main",
      inputs: {
        title: videoTitle,
        text: base64Html,
        color: `${videoDuration}s`,
      },
    };

    if (!token) {
      console.warn("ADVERTENCIA: GITHUB_TOKEN no está configurado en el entorno del servidor.");
      return NextResponse.json(
        {
          error: "Falta configuración de GITHUB_TOKEN",
          details:
            "El servidor no tiene configurada la variable de entorno GITHUB_TOKEN con permisos sobre el repositorio para disparar GitHub Actions.",
        },
        { status: 500 }
      );
    }

    const githubResponse = await fetch(githubUrl, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "ZYRVAE-Media-Studio",
      },
      body: JSON.stringify(payload),
    });

    if (githubResponse.status === 204 || githubResponse.ok) {
      return NextResponse.json({
        success: true,
        message: "¡Conversión a video MP4 iniciada en GitHub Actions con HyperFrames!",
        title: videoTitle,
        duration: `${videoDuration}s`,
      });
    }

    const errorText = await githubResponse.text();
    console.error("Error de GitHub API al despachar workflow:", githubResponse.status, errorText);

    return NextResponse.json(
      {
        error: "Error devuelto por la API de GitHub",
        status: githubResponse.status,
        details: errorText,
      },
      {
        status:
          githubResponse.status >= 200 && githubResponse.status <= 599
            ? githubResponse.status
            : 500,
      }
    );
  } catch (error) {
    console.error("Error inesperado en /api/render:", error);
    return NextResponse.json(
      {
        error: "Error interno en el servidor",
        status: 500,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
