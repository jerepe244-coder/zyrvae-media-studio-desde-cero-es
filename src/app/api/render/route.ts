import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { title, text, color } = body;

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.error("Error: Variable de entorno GITHUB_TOKEN no configurada.");
      return NextResponse.json(
        {
          error: "GITHUB_TOKEN no está configurado en las variables de entorno del servidor.",
          details: "Por favor configura GITHUB_TOKEN con permisos de 'repo' o 'actions:write' en tu entorno o archivo .env.local",
        },
        { status: 500 }
      );
    }

    const githubUrl =
      "https://api.github.com/repos/jerepe244-coder/zyrvae-media-studio-desde-cero-es/actions/workflows/render-video.yml/dispatches";

    const payload = {
      ref: "main",
      inputs: {
        title: title ? String(title) : "Comercial ZYRVAE",
        text: text ? String(text) : "Potencia tu marca con video de alta conversión",
        color: color ? String(color) : "#6366f1",
      },
    };

    const githubResponse = await fetch(githubUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "ZYRVAE-Media-Studio",
      },
      body: JSON.stringify(payload),
    });

    if (githubResponse.status === 204 || githubResponse.ok) {
      return NextResponse.json({
        success: true,
        message: "Renderizado enviado a GitHub Actions con éxito",
      });
    }

    const errorText = await githubResponse.text();
    console.error("Error de GitHub API al despachar workflow:", githubResponse.status, errorText);

    return NextResponse.json(
      {
        error: "Error al comunicarse con la API de GitHub",
        status: githubResponse.status,
        details: errorText,
      },
      { status: githubResponse.status }
    );
  } catch (error) {
    console.error("Error inesperado en /api/render:", error);
    return NextResponse.json(
      {
        error: "Error interno en el servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
