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

function isPrivateOrLocalHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "::1" ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return true;
  }
  if (/^10\./.test(host) || /^192\.168\./.test(host)) return true;
  const match172 = host.match(/^172\.(\d+)\./);
  if (match172) {
    const secondOctet = Number(match172[1]);
    if (secondOctet >= 16 && secondOctet <= 31) return true;
  }
  return false;
}

export function isPublicHttpsUrl(rawUrl: string): boolean {
  if (!rawUrl) return false;
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === "https:" && !isPrivateOrLocalHostname(parsed.hostname);
  } catch {
    return false;
  }
}

export function getPublicRendererUrl(backendFallback?: string): string | null {
  const candidates = [
    process.env.RENDERER_PUBLIC_URL,
    process.env.NEXT_PUBLIC_RENDERER_URL,
    backendFallback,
  ]
    .map((u) => (u || "").trim().replace(/\/$/, ""))
    .filter(Boolean);

  for (const candidate of candidates) {
    if (isPublicHttpsUrl(candidate)) return candidate;
  }
  return null;
}

const MAX_VERCEL_AUDIO_BASE64_CHARS = Math.ceil(3.5 * 1024 * 1024 * 1.37);

// Consultar estado de un trabajo (?jobId=...), descargar MP4 (?jobId=...&download=1) o precalentar motor (/health)
export async function GET(request: Request) {
  const backendUrl = getRendererUrl();
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId")?.trim();
  const wantsDownload =
    searchParams.get("download") === "1" || searchParams.get("download") === "true";

  if (jobId) {
    if (!backendUrl) {
      return NextResponse.json(
        { error: "Motor en la nube no configurado", fallbackToBrowser: true },
        { status: 503 }
      );
    }

    const cleanUrl = backendUrl.replace(/\/$/, "");

    if (wantsDownload) {
      try {
        const upstream = await fetch(
          `${cleanUrl}/render/download/${encodeURIComponent(jobId)}`,
          {
            cache: "no-store",
            signal: AbortSignal.timeout(45000),
          }
        );

        if (!upstream.ok || !upstream.body) {
          const errText = await upstream.text().catch(() => "");
          return NextResponse.json(
            { error: "No se pudo descargar el MP4", details: errText },
            { status: upstream.status || 502 }
          );
        }

        const headers = new Headers();
        headers.set("Content-Type", upstream.headers.get("content-type") || "video/mp4");
        const contentDisposition = upstream.headers.get("content-disposition");
        if (contentDisposition) headers.set("Content-Disposition", contentDisposition);
        const contentLength = upstream.headers.get("content-length");
        if (contentLength) headers.set("Content-Length", contentLength);
        headers.set("X-Engine", "Dedicated-Render-Cloud-v3");

        return new Response(upstream.body, {
          status: 200,
          headers,
        });
      } catch (err: unknown) {
        return NextResponse.json(
          {
            error: "Error al transmitir descarga MP4",
            details: err instanceof Error ? err.message : String(err),
          },
          { status: 502 }
        );
      }
    }

    try {
      const statusRes = await fetch(
        `${cleanUrl}/render?jobId=${encodeURIComponent(jobId)}`,
        {
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        }
      );

      const data = await statusRes.json().catch(() => null);
      if (!statusRes.ok || !data) {
        return NextResponse.json(
          {
            error: data?.error || "No se pudo consultar el progreso del trabajo",
            jobId,
          },
          { status: statusRes.status || 502 }
        );
      }

      const publicUrl = getPublicRendererUrl(cleanUrl);
      return NextResponse.json({
        ...data,
        rendererUrl: publicUrl,
        directDownloadUrl:
          data.status === "done" && publicUrl
            ? `${publicUrl}/render/download/${encodeURIComponent(jobId)}`
            : null,
        downloadUrl:
          data.status === "done"
            ? `/api/render?jobId=${encodeURIComponent(jobId)}&download=1`
            : null,
      });
    } catch (err: unknown) {
      return NextResponse.json(
        {
          error: "Error consultando estado del render",
          details: err instanceof Error ? err.message : String(err),
        },
        { status: 502 }
      );
    }
  }

  // Sin jobId: verificar estado y despertar (pre-warm) el motor dedicado en la nube
  if (backendUrl) {
    const publicUrl = getPublicRendererUrl(backendUrl);
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
          rendererUrl: publicUrl,
          url: publicUrl,
          details: data,
        });
      }
    } catch (err: unknown) {
      return NextResponse.json({
        status: "waking_up",
        engine: "Render.com / Railway + Browser Hybrid",
        rendererUrl: publicUrl,
        url: publicUrl,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return NextResponse.json({
    status: "browser_ready",
    engine: "Motor Híbrido (Cloud + Navegador)",
    rendererUrl: getPublicRendererUrl(backendUrl),
  });
}

// Inicia un trabajo asíncrono de renderizado en renderer-service y devuelve { jobId } de inmediato
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
      fps,
      accentColor,
      width,
      height,
      cleanVideo,
      audioData,
      audioBase64,
      audioExt,
      musicPresetId,
      voiceoverBase64,
      voiceoverData,
      voiceoverExt,
      sfxEvents,
    } = body || {};

    const resolvedAudioBase64 =
      typeof audioBase64 === "string"
        ? audioBase64
        : typeof audioData === "string"
          ? audioData
          : "";
    const resolvedVoiceoverBase64 =
      typeof voiceoverBase64 === "string"
        ? voiceoverBase64
        : typeof voiceoverData === "string"
          ? voiceoverData
          : "";
    const resolvedSfxBase64Length = Array.isArray(sfxEvents)
      ? sfxEvents.reduce(
          (acc, ev) =>
            acc + (ev && typeof ev.customBase64 === "string" ? ev.customBase64.length : 0),
          0
        )
      : 0;

    if (
      resolvedAudioBase64.length + resolvedVoiceoverBase64.length + resolvedSfxBase64Length >
      MAX_VERCEL_AUDIO_BASE64_CHARS
    ) {
      return NextResponse.json(
        {
          error: "Audio combinado demasiado pesado para el proxy de Vercel",
          message:
            "La suma de música, voz en off y SFX supera ~3.5 MB (límite 4.5 MB de Vercel). Usá un .mp3 más liviano o conexión directa con el microservicio.",
        },
        { status: 413 }
      );
    }

    const videoTitle =
      (title && String(title).trim()) || props?.title || "Comercial ZYRVAE";
    const videoDuration = duration
      ? String(duration).replace(/[^0-9]/g, "") || "15"
      : "15";
    const selectedColor = accentColor || props?.accentColor || "#6366f1";
    const safeNumDuration = Math.min(Math.max(parseInt(videoDuration, 10) || 15, 1), 120);
    const safeNumFps = Math.min(Math.max(Math.round(Number(fps) || 30), 1), 60);

    if (backendUrl) {
      const cleanBackendUrl = backendUrl.replace(/\/$/, "");

      const rendererPayload = {
        mode: mode || (html || html_code ? "html" : "remotion"),
        html: html || html_code || "",
        title: videoTitle,
        duration: safeNumDuration,
        fps: safeNumFps,
        width: Number(width) || 1080,
        height: Number(height) || 1920,
        cleanVideo: cleanVideo !== false,
        accentColor: selectedColor,
        audioData: resolvedAudioBase64 || null,
        audioExt: audioExt || null,
        musicPresetId: typeof musicPresetId === "string" ? musicPresetId : null,
        voiceoverBase64: resolvedVoiceoverBase64 || null,
        voiceoverExt: voiceoverExt || (resolvedVoiceoverBase64 ? "mp3" : null),
        sfxEvents: Array.isArray(sfxEvents) ? sfxEvents : [],
        async: true,
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
      };

      let microserviceResponse: Response | null = null;
      let lastErrorText = "";

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          microserviceResponse = await fetch(`${cleanBackendUrl}/render`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(rendererPayload),
            signal: AbortSignal.timeout(15000),
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
      if (contentType.includes("application/json")) {
        const jobData = await microserviceResponse.json().catch(() => ({}));
        if (jobData?.jobId) {
          const publicUrl = getPublicRendererUrl(cleanBackendUrl);
          return NextResponse.json(
            {
              success: true,
              engine: "Render.com / Railway Dedicated Microservice",
              rendererUrl: publicUrl,
              ...jobData,
            },
            { status: 202 }
          );
        }
      }

      // Compatibilidad si un microservicio antiguo devolviera video/mp4 directo
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

      return NextResponse.json(
        {
          error: "Respuesta inesperada del microservicio de renderizado",
          fallbackToBrowser: true,
        },
        { status: 502 }
      );
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
