import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { title, text, color } = body;

    const githubToken = (
      process.env.GITHUB_TOKEN ||
      process.env.GH_TOKEN ||
      process.env.GITHUB_PAT
    )?.trim();

    if (!githubToken) {
      console.error("Error: Variable de entorno GITHUB_TOKEN no configurada en Vercel o entorno local.");
      return NextResponse.json(
        {
          error: "GITHUB_TOKEN no está configurado en las variables de entorno del servidor.",
          details:
            "GITHUB_TOKEN no está presente en este despliegue. Recuerda que si acabas de agregar la variable en Vercel (Project Settings > Environment Variables), debes hacer un 'Redeploy' en Vercel para que surta efecto, y asegurarte de marcar el entorno 'Production'.",
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

    let friendlyAdvice = "";
    if (githubResponse.status === 401) {
      friendlyAdvice = "El token de GitHub no es válido o ha expirado. Por favor genera un nuevo token en GitHub.";
    } else if (githubResponse.status === 403 || githubResponse.status === 404) {
      friendlyAdvice =
        "Permisos insuficientes: Asegúrate de que el token de GitHub tenga permisos de 'repo' y 'workflow' (o 'actions:write' si es Fine-grained). GitHub devuelve 404 o 403 si el token no tiene acceso a este repositorio.";
    }

    return NextResponse.json(
      {
        error: "Error al comunicarse con la API de GitHub",
        status: githubResponse.status,
        details: friendlyAdvice ? `${friendlyAdvice} (${errorText})` : errorText,
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
