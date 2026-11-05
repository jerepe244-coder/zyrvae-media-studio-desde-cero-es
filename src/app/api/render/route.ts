import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const rawToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
    const token = rawToken.trim();

    const body = await request.json().catch(() => ({}));
    const { mode, html, html_code, title, props, remotionProps, duration, accentColor } = body || {};

    const videoTitle = (title && String(title).trim()) || props?.title || "Comercial ZYRVAE";
    const videoDuration = duration ? String(duration).replace(/[^0-9]/g, "") || "10" : "10";
    const selectedColor = accentColor || props?.accentColor || "#6366f1";

    let payloadText = "";

    // Determinar si la orden es de conversión de código HTML o plantilla Remotion
    if (mode === "html" || (html && String(html).trim())) {
      const htmlPayload = {
        mode: "html",
        html: String(html || html_code || "").trim(),
        title: videoTitle,
      };
      payloadText = Buffer.from(JSON.stringify(htmlPayload), "utf-8").toString("base64");
    } else {
      // Unificar propiedades para Remotion
      const finalRemotionProps = {
        title: videoTitle,
        subtitle: props?.subtitle || "Imprenta de Video Automatizada",
        description:
          props?.description ||
          "Diseño premium de alta conversión con tecnología Remotion para anuncios 9:16 Ultra HD.",
        brandName: props?.brandName || "ZYRVAE MEDIA STUDIO",
        accentColor: selectedColor,
        badgeText: props?.badgeText || "Comercial ZYRVAE",
        statsValue: props?.statsValue || "+300%",
        statsLabel: props?.statsLabel || "Conversión de Marca",
        callToAction: props?.callToAction || "Potencia tu Negocio Hoy",
        ...(remotionProps || {}),
        ...(props || {}),
      };
      payloadText = Buffer.from(JSON.stringify(finalRemotionProps), "utf-8").toString("base64");
    }

    const githubUrl =
      "https://api.github.com/repos/jerepe244-coder/zyrvae-media-studio-desde-cero-es/actions/workflows/render-video.yml/dispatches";

    // Enviamos el payload base64 en inputs.text y la duración en inputs.color
    // 100% compatible con el workflow render-video.yml en main
    const payload = {
      ref: "main",
      inputs: {
        title: videoTitle,
        text: payloadText,
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
        message:
          mode === "html" || html
            ? "¡Conversión de HTML a video MP4 iniciada con éxito en GitHub Actions!"
            : "¡Conversión a video MP4 iniciada en GitHub Actions con Remotion!",
        title: videoTitle,
        duration: `${videoDuration}s`,
        engine: mode === "html" || html ? "HyperFrames (HTML -> MP4)" : "Remotion",
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
