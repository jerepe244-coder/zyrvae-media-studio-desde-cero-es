import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log("TOKEN EXISTE:", !!process.env.GITHUB_TOKEN);

    const body = await request.json().catch(() => ({}));
    const { title, text, color } = body || {};

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

    const rawToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
    const token = rawToken.trim();

    const githubResponse = await fetch(githubUrl, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token || process.env.GITHUB_TOKEN}`,
        "X-GitHub-Api-Version": "2022-11-28",
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
        error: "Error devuelto por la API de GitHub",
        status: githubResponse.status,
        details: errorText,
      },
      {
        status: githubResponse.status >= 200 && githubResponse.status <= 599 ? githubResponse.status : 500,
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
