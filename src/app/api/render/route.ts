import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Obtiene la URL configurada del microservicio dedicado en Render.com o Railway.
 * Acepta múltiples nombres de variables de entorno y cuenta con la URL por defecto
 * del Blueprint de Render (https://zyrvae-video-renderer.onrender.com).
 */
export function getRendererUrl(): string {
  const rawUrl = (
    process.env.RENDERER_URL ||
    process.env.RENDER_URL ||
    process.env.RENDER_BACKEND_URL ||
    process.env.RENDERER_SERVICE_URL ||
    process.env.RENDER_SERVICE_URL ||
    process.env.VIDEO_RENDERER_URL ||
    process.env.NEXT_PUBLIC_RENDERER_URL ||
    "https://zyrvae-video-renderer.onrender.com"
  ).trim();

  return rawUrl.replace(/\/$/, "");
}

// Verificar el estado de la conexión con el motor de renderizado dedicado
export async function GET() {
  const backendUrl = getRendererUrl();

  if (backendUrl) {
    try {
      const cleanUrl = backendUrl.replace(/\/$/, "");
      const res = await fetch(`${cleanUrl}/health`, {
        signal: AbortSignal.timeout(4000),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        return NextResponse.json({
          status: "connected",
          engine: "Render.com / Railway Dedicated Microservice",
          url: cleanUrl,
          details: data,
        });
      }
    } catch (err: unknown) {
      return NextResponse.json({
        status: "offline",
        engine: "Render.com / Railway",
        url: backendUrl,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const hasGithubToken = Boolean(
    (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "").trim()
  );

  return NextResponse.json({
    status: hasGithubToken ? "github_actions_fallback" : "not_configured",
    engine: hasGithubToken ? "GitHub Actions (Fallback)" : "None",
    message: hasGithubToken
      ? "Configurado en modo fallback vía GitHub Actions. Para activar el nuevo motor dedicado en tiempo real, añade RENDERER_URL."
      : "No hay motor de renderizado configurado. Define RENDERER_URL (Render.com/Railway) o GITHUB_TOKEN.",
  });
}

export async function POST(request: Request) {
  try {
    const backendUrl = getRendererUrl();

    const rawToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
    const token = rawToken.trim();

    const body = await request.json().catch(() => ({}));
    const {
      mode,
      html,
      html_code,
      title,
      props,
      remotionProps,
      duration,
      accentColor,
      destination = "device",
    } = body || {};

    const videoTitle = (title && String(title).trim()) || props?.title || "Comercial ZYRVAE";
    const videoDuration = duration ? String(duration).replace(/[^0-9]/g, "") || "10" : "10";
    const selectedColor = accentColor || props?.accentColor || "#6366f1";
    const safeNumDuration = parseInt(videoDuration, 10) || 10;

    // -------------------------------------------------------------
    // RUTA 1: MICROSERVICIO DEDICADO EN LA NUBE (RENDER.COM / RAILWAY)
    // -------------------------------------------------------------
    if (backendUrl) {
      console.log(`[API /render] Enviando orden al microservidor dedicado: ${backendUrl}`);
      const cleanBackendUrl = backendUrl.replace(/\/$/, "");

      const rendererPayload = {
        mode: mode || (html || html_code ? "html" : "remotion"),
        html: html || html_code || "",
        title: videoTitle,
        duration: safeNumDuration,
        fps: 30,
        width: 1080,
        height: 1920,
        accentColor: selectedColor,
        props: {
          title: videoTitle,
          subtitle: props?.subtitle || "Imprenta de Video Automatizada",
          description:
            props?.description ||
            "Diseño premium de alta conversión con tecnología para anuncios 9:16 Ultra HD.",
          brandName: props?.brandName || "ZYRVAE MEDIA STUDIO",
          accentColor: selectedColor,
          badgeText: props?.badgeText || "Comercial ZYRVAE",
          statsValue: props?.statsValue || "+300%",
          statsLabel: props?.statsLabel || "Conversión de Marca",
          callToAction: props?.callToAction || "Potencia tu Negocio Hoy",
          ...(remotionProps || {}),
          ...(props || {}),
        },
        download: true,
      };

      const microserviceResponse = await fetch(`${cleanBackendUrl}/render`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "video/mp4, application/json",
        },
        body: JSON.stringify(rendererPayload),
      });

      if (!microserviceResponse.ok) {
        const errorText = await microserviceResponse.text().catch(() => "");
        console.error("[API /render] Error del microservicio dedicado:", microserviceResponse.status, errorText);
        throw new Error(
          `Error en el motor dedicado (${microserviceResponse.status}): ${errorText || "Respuesta fallida del microservicio"}`
        );
      }

      const contentType = microserviceResponse.headers.get("content-type") || "";

      // Si el microservicio devuelve el archivo de video binario MP4 directamente
      if (contentType.includes("video/mp4") || contentType.includes("octet-stream")) {
        const videoBuffer = await microserviceResponse.arrayBuffer();
        const safeFilename = `${videoTitle.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim().replace(/\s+/g, "_")}.mp4`;

        return new Response(videoBuffer, {
          status: 200,
          headers: {
            "Content-Type": "video/mp4",
            "Content-Disposition": `attachment; filename="${safeFilename}"`,
            "Content-Length": String(videoBuffer.byteLength),
            "X-Engine": "Dedicated-Render-Cloud",
            "X-Title": encodeURIComponent(videoTitle),
          },
        });
      }

      // Si devolvió JSON informativo
      const jsonResult = await microserviceResponse.json().catch(() => ({}));
      return NextResponse.json({
        success: true,
        engine: "Render.com / Railway Cloud Engine",
        ...jsonResult,
      });
    }

    // -------------------------------------------------------------
    // RUTA 2: FALLBACK EN CASO DE USAR GITHUB ACTIONS
    // -------------------------------------------------------------
    if (token) {
      let payloadText = "";

      if (mode === "html" || (html && String(html).trim())) {
        const htmlPayload = {
          mode: "html",
          html: String(html || html_code || "").trim(),
          title: videoTitle,
        };
        payloadText = Buffer.from(JSON.stringify(htmlPayload), "utf-8").toString("base64");
      } else {
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

      const payload = {
        ref: "main",
        inputs: {
          title: videoTitle,
          text: payloadText,
          color: `${videoDuration}s`,
        },
      };

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
          engine: "GitHub Actions (Fallback)",
        });
      }

      const errorText = await githubResponse.text();
      return NextResponse.json(
        {
          error: "Error devuelto por la API de GitHub Actions",
          status: githubResponse.status,
          details: errorText,
        },
        { status: 500 }
      );
    }

    // -------------------------------------------------------------
    // RUTA 3: NINGUNA VARIABLE CONFIGURADA AÚN
    // -------------------------------------------------------------
    return NextResponse.json(
      {
        error: "Motor de renderizado no configurado",
        details:
          "Para renderizar videos MP4, configura la variable de entorno RENDERER_URL con la URL de tu microservicio en Render.com o Railway (ejemplo: https://zyrvae-renderer.onrender.com), o GITHUB_TOKEN como fallback.",
        architecture: "Híbrida Nube-Servidor (Vercel Frontend + Render/Railway Dedicated Engine)",
      },
      { status: 503 }
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
