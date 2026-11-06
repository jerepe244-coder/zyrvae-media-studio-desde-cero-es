import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Obtiene la URL configurada del microservicio dedicado en Render.com o Railway.
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

// Verificar estado y despertar (pre-warm) el motor dedicado en la nube
export async function GET() {
  const backendUrl = getRendererUrl();

  if (backendUrl) {
    try {
      const cleanUrl = backendUrl.replace(/\/$/, "");
      const res = await fetch(`${cleanUrl}/health`, {
        signal: AbortSignal.timeout(6000),
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        return NextResponse.json({
          status: "connected",
          engine: "Render.com / Railway Dedicated Microservice",
          rendererUrl: cleanUrl,
          url: cleanUrl,
          details: data,
        });
      }
    } catch (err: unknown) {
      return NextResponse.json({
        status: "waking_up",
        engine: "Render.com / Railway + Browser Hybrid",
        rendererUrl: backendUrl,
        url: backendUrl,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    status: "browser_ready",
    engine: "Motor Híbrido (Cloud + Navegador)",
    rendererUrl: backendUrl,
  });
}

export async function POST(request: Request) {
  try {
    const backendUrl = getRendererUrl();
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
      width,
      height,
      cleanVideo,
    } = body || {};

    const videoTitle =
      (title && String(title).trim()) || props?.title || "Comercial ZYRVAE";
    const videoDuration = duration
      ? String(duration).replace(/[^0-9]/g, "") || "15"
      : "15";
    const selectedColor = accentColor || props?.accentColor || "#6366f1";
    const safeNumDuration = Math.min(Math.max(parseInt(videoDuration, 10) || 15, 1), 120);

    if (backendUrl) {
      const cleanBackendUrl = backendUrl.replace(/\/$/, "");

      const rendererPayload = {
        mode: mode || (html || html_code ? "html" : "remotion"),
        html: html || html_code || "",
        title: videoTitle,
        duration: safeNumDuration,
        fps: 24,
        width: Number(width) || 1080,
        height: Number(height) || 1920,
        cleanVideo: cleanVideo !== false,
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

      // Intentar renderizado con reintento automático si el contenedor está despertando (502/503)
      let microserviceResponse: Response | null = null;
      let lastErrorText = "";

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          microserviceResponse = await fetch(`${cleanBackendUrl}/render`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "video/mp4, application/json",
            },
            body: JSON.stringify(rendererPayload),
            signal: AbortSignal.timeout(48000),
          });

          if (
            (microserviceResponse.status === 502 || microserviceResponse.status === 503) &&
            attempt === 1
          ) {
            await new Promise((r) => setTimeout(r, 2500));
            continue;
          }
          break;
        } catch (fetchErr) {
          lastErrorText = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
          if (attempt === 1) {
            await new Promise((r) => setTimeout(r, 2000));
          }
        }
      }

      if (!microserviceResponse || !microserviceResponse.ok) {
        const status = microserviceResponse?.status || 503;
        const errorText = microserviceResponse
          ? await microserviceResponse.text().catch(() => "")
          : lastErrorText;

        return NextResponse.json(
          {
            error: "Microservicio en actualización o ocupado",
            fallbackToBrowser: true,
            status,
            details: errorText || "Usando motor de respaldo integrado.",
          },
          { status: 503 }
        );
      }

      const contentType = microserviceResponse.headers.get("content-type") || "";

      if (contentType.includes("video/mp4") || contentType.includes("octet-stream")) {
        const videoBuffer = await microserviceResponse.arrayBuffer();
        const safeFilename = `${videoTitle
          .replace(/[^a-zA-Z0-9_\-\s]/g, "")
          .trim()
          .replace(/\s+/g, "_")}.mp4`;

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

      const jsonResult = await microserviceResponse.json().catch(() => ({}));
      return NextResponse.json({
        success: true,
        engine: "Render.com / Railway Cloud Engine",
        ...jsonResult,
      });
    }

    return NextResponse.json(
      {
        error: "Motor en la nube no configurado",
        fallbackToBrowser: true,
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("Error inesperado en /api/render:", error);
    return NextResponse.json(
      {
        error: "Error en la conexión con el servidor",
        fallbackToBrowser: true,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
