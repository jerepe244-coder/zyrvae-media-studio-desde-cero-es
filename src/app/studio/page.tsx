"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clapperboard,
  ArrowLeft,
  Loader2,
  Download,
  Smartphone,
  FileCode2,
  Copy,
  Trash2,
  Check,
  Clock,
  Code2,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { renderHtmlToMp4InBrowser } from "@/lib/browser-mp4-converter";

const DEFAULT_RENDERER_URL =
  process.env.NEXT_PUBLIC_RENDERER_URL || "https://zyrvae-video-renderer.onrender.com";

// Plantilla 1: Comercial Principal ZYRVAE (9:16 Vertical 1080x1920)
const createSampleAdHtml = (seconds: number = 15) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, height=1920">
  <title>Comercial ZYRVAE - Imprenta de Video</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    html, body { width: 1080px; height: 1920px; overflow: hidden; background: #09090b; color: #ffffff; }
    .canvas {
      position: relative; width: 1080px; height: 1920px;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 120px 80px;
      background: radial-gradient(circle at 50% 25%, #2e1065 0%, #09090b 70%);
      overflow: hidden;
    }
    .orb {
      position: absolute; width: 700px; height: 700px; border-radius: 50%;
      background: radial-gradient(circle, #6366f1 0%, transparent 70%);
      opacity: 0.35; filter: blur(80px); animation: float 6s ease-in-out infinite alternate;
    }
    @keyframes float {
      0% { transform: translate(50px, 120px) scale(0.9); }
      100% { transform: translate(320px, 400px) scale(1.2); }
    }
    .badge {
      display: inline-flex; align-items: center; gap: 16px;
      padding: 16px 32px; border-radius: 9999px;
      background: rgba(24, 24, 27, 0.8); border: 1px solid rgba(255, 255, 255, 0.15);
      width: fit-content; z-index: 10;
      animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .badge-dot { width: 16px; height: 16px; border-radius: 50%; background: #10b981; box-shadow: 0 0 20px #10b981; }
    .badge-text { font-size: 24px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #f4f4f5; }
    .hero { position: relative; z-index: 10; display: flex; flex-direction: column; gap: 36px; margin: auto 0; }
    .tag { font-size: 32px; font-weight: 800; color: #818cf8; text-transform: uppercase; letter-spacing: 0.2em; }
    .title { font-size: 88px; font-weight: 900; line-height: 1.05; letter-spacing: -0.04em; color: #ffffff; }
    .title span { color: #a855f7; }
    .desc { font-size: 36px; line-height: 1.45; color: #a1a1aa; max-width: 920px; }
    .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 10px; }
    .stat-card {
      background: rgba(24, 24, 27, 0.75); border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 32px; border-radius: 28px;
    }
    .stat-val { font-size: 54px; font-weight: 900; color: #ffffff; }
    .stat-lbl { font-size: 22px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 6px; }
    .footer { position: relative; z-index: 10; display: flex; flex-direction: column; gap: 24px; }
    .progress-track { width: 100%; height: 10px; background: rgba(255, 255, 255, 0.12); border-radius: 6px; overflow: hidden; }
    .progress-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #6366f1, #ec4899); animation: fillProgress ${seconds}s linear forwards; }
    @keyframes fillProgress { 0% { width: 0%; } 100% { width: 100%; } }
    .foot-labels { display: flex; justify-content: space-between; font-size: 24px; color: #71717a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body data-duration="${seconds}" data-width="1080" data-height="1920">
  <div class="canvas">
    <div class="orb"></div>
    <div class="badge">
      <span class="badge-dot"></span>
      <span class="badge-text">ZYRVAE MEDIA STUDIO</span>
    </div>
    <div class="hero">
      <span class="tag">Convertidor HTML a Video</span>
      <h1 class="title">Tu publicidad en código, <span>convertida a MP4</span> al instante.</h1>
      <p class="desc">Imprenta automatizada en resolución vertical 9:16 lista para Reels, TikTok y Shorts.</p>
      <div class="card-grid">
        <div class="stat-card">
          <div class="stat-val">+300%</div>
          <div class="stat-lbl">Retención Visual</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">9:16 HD</div>
          <div class="stat-lbl">Vertical Nativo</div>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="progress-track"><div class="progress-fill"></div></div>
      <div class="foot-labels">
        <span>Renderizado a Video MP4</span>
        <span>9:16 Vertical</span>
      </div>
    </div>
  </div>
</body>
</html>`;

// Plantilla 2: Oferta Flash
const createFlashSaleHtml = (seconds: number = 15) => `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=1080, height=1920">
  <title>Oferta Flash - ZYRVAE</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    html, body { width: 1080px; height: 1920px; overflow: hidden; background: #09090b; color: #ffffff; }
    .canvas {
      position: relative; width: 1080px; height: 1920px;
      display: flex; flex-direction: column; justify-content: space-between;
      padding: 120px 80px;
      background: radial-gradient(circle at 50% 20%, #4c0519 0%, #09090b 70%);
      overflow: hidden;
    }
    .badge {
      display: inline-flex; align-items: center; gap: 16px;
      padding: 18px 36px; border-radius: 9999px;
      background: #f43f5e; color: #ffffff; font-size: 26px; font-weight: 800;
      letter-spacing: 0.12em; text-transform: uppercase; width: fit-content;
    }
    .hero { display: flex; flex-direction: column; gap: 36px; margin: auto 0; }
    .discount { font-size: 150px; font-weight: 900; color: #fb7185; line-height: 1; letter-spacing: -0.04em; }
    .title { font-size: 82px; font-weight: 900; line-height: 1.08; color: #ffffff; }
    .desc { font-size: 36px; line-height: 1.45; color: #fda4af; }
    .cta {
      background: #f43f5e; color: #ffffff; font-size: 38px; font-weight: 800;
      text-align: center; padding: 38px; border-radius: 28px; margin-top: 20px;
    }
    .progress-track { width: 100%; height: 10px; background: rgba(255,255,255,0.12); border-radius: 6px; overflow: hidden; }
    .progress-fill { height: 100%; width: 0%; background: #f43f5e; animation: fillProgress ${seconds}s linear forwards; }
    @keyframes fillProgress { 0% { width: 0%; } 100% { width: 100%; } }
  </style>
</head>
<body data-duration="${seconds}">
  <div class="canvas">
    <div class="badge">🔥 OFERTA POR TIEMPO LIMITADO</div>
    <div class="hero">
      <div class="discount">50% OFF</div>
      <h1 class="title">Gran Venta Exclusiva de Temporada</h1>
      <p class="desc">Aprovecha descuentos directos en toda nuestra línea premium antes de que termine hoy.</p>
      <div class="cta">Comprar con Descuento Ahora →</div>
    </div>
    <div class="progress-track"><div class="progress-fill"></div></div>
  </div>
</body>
</html>`;

const DURATION_PRESETS = [
  { seconds: 15, label: "15s", desc: "Reel / Story Rápido", badge: "Más Rápido" },
  { seconds: 30, label: "30s", desc: "Comercial Estándar" },
  { seconds: 60, label: "1 min", desc: "Anuncio Completo" },
];

export default function StudioPage() {
  // Pestaña en vista móvil: "editor" o "preview"
  const [mobileTab, setMobileTab] = React.useState<"editor" | "preview">("editor");

  // Duración por defecto en 15s para conversión ultrarrápida (configurable a 30s, 60s o custom)
  const [durationSeconds, setDurationSeconds] = React.useState<number>(15);

  // Formato / Proporción de video y Modo Publicación Limpio (sin paneles ni controles)
  const [aspectRatio, setAspectRatio] = React.useState<"9:16" | "16:9" | "1:1">("9:16");
  const [cleanVideoMode, setCleanVideoMode] = React.useState<boolean>(true);

  // Estado del código HTML y versión debounced para que la página nunca se trabe al escribir o pegar
  const [htmlCode, setHtmlCode] = React.useState<string>(() => createSampleAdHtml(15));
  const [debouncedHtml, setDebouncedHtml] = React.useState<string>(() => createSampleAdHtml(15));
  const [htmlTitle, setHtmlTitle] = React.useState<string>("Comercial_ZYRVAE");
  const [copied, setCopied] = React.useState(false);
  const [iframeKey, setIframeKey] = React.useState(0);

  // URL del microservicio de renderizado (detectada automáticamente)
  const [rendererUrl, setRendererUrl] = React.useState<string>(DEFAULT_RENDERER_URL);

  // Estado de conversión y progreso en vivo
  const [isLoading, setIsLoading] = React.useState(false);
  const [progressPercent, setProgressPercent] = React.useState<number>(0);
  const [progressStatus, setProgressStatus] = React.useState<string>("");

  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
    details?: string;
    engine?: string;
    downloadUrl?: string;
    filename?: string;
  } | null>(null);
  const [showResultModal, setShowResultModal] = React.useState(false);

  // Referencia y escala para el iframe HTML responsivo
  const phoneContainerRef = React.useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = React.useState<number>(0.26);

  // Dimensiones según la proporción seleccionada
  const dimensions = React.useMemo(() => {
    switch (aspectRatio) {
      case "16:9":
        return { width: 1920, height: 1080, label: "16:9 Horizontal (YouTube)" };
      case "1:1":
        return { width: 1080, height: 1080, label: "1:1 Cuadrado (Instagram)" };
      case "9:16":
      default:
        return { width: 1080, height: 1920, label: "9:16 Vertical (TikTok/Reels)" };
    }
  }, [aspectRatio]);

  // HTML limpio para vista previa sin paneles interactivos
  const previewHtml = React.useMemo(() => {
    if (!cleanVideoMode) return debouncedHtml;
    const cleanStyle = `<style id="__zyrvae_clean_preview">
      .panel, #panel, .controls, #controls, .toolbar, #toolbar, .sidebar, #sidebar,
      .player-controls, .video-controls, .control-bar, .playback-bar,
      .vjs-control-bar, .plyr__controls, .jw-controls,
      button[class*="play"], button[id*="play"], [aria-label*="play" i], [aria-label*="reproducir" i],
      .play-btn, .play-button, .btn-play, #play-button, #playBtn, .btn-reproducir,
      .timeline, #timeline {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      video, canvas, .video, #video, .video-container, .player, #player, .composition, .canvas, #canvas, .main-stage {
        max-width: 100% !important;
        max-height: 100% !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: contain !important;
        margin: 0 auto !important;
      }
    </style>`;
    if (debouncedHtml.includes("<head>")) {
      return debouncedHtml.replace("<head>", `<head>${cleanStyle}`);
    }
    return `${cleanStyle}${debouncedHtml}`;
  }, [debouncedHtml, cleanVideoMode]);

  // Debounce del HTML para la vista previa: evita recrear el iframe en cada tecla o pegado grande
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHtml(htmlCode);
    }, 350);
    return () => clearTimeout(timer);
  }, [htmlCode]);

  // Precalentar (wake up) el servidor de Render automáticamente al abrir la página
  React.useEffect(() => {
    let active = true;
    const warmUpEngines = async () => {
      try {
        // 1. Consultar API interna para obtener URL configurada y despertar servidor
        const res = await fetch("/api/render", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (active && data?.rendererUrl) {
          setRendererUrl(String(data.rendererUrl).replace(/\/$/, ""));
        }
      } catch {}

      try {
        // 2. Ping directo no bloqueante al microservicio en la nube
        await fetch(`${DEFAULT_RENDERER_URL.replace(/\/$/, "")}/health`, {
          mode: "cors",
          cache: "no-store",
        });
      } catch {}
    };
    warmUpEngines();
    return () => {
      active = false;
    };
  }, []);

  // Calcular escala para el visor según resolución activa
  React.useEffect(() => {
    const updateScale = () => {
      if (phoneContainerRef.current) {
        const width = phoneContainerRef.current.clientWidth;
        if (width > 0) {
          setPreviewScale((width - 24) / dimensions.width);
        }
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [mobileTab, dimensions.width]);

  // Cambiar duración y sincronizar con el código HTML si aplica
  const handleChangeDuration = (sec: number) => {
    setDurationSeconds(sec);
    if (htmlCode.includes("fillProgress")) {
      const updated = htmlCode
        .replace(/fillProgress\s+\d+s/gi, `fillProgress ${sec}s`)
        .replace(/data-duration=["']\d+["']/gi, `data-duration="${sec}"`);
      setHtmlCode(updated);
      setDebouncedHtml(updated);
    }
  };

  // Copiar código HTML al portapapeles
  const handleCopyHtml = async () => {
    try {
      await navigator.clipboard.writeText(htmlCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  // Descargar automáticamente un Blob MP4 en el dispositivo del usuario
  const triggerMp4Download = (blob: Blob, rawTitle: string): { url: string; filename: string } => {
    const cleanName =
      (rawTitle || "Comercial_ZYRVAE")
        .replace(/\.mp4$/i, "")
        .replace(/[^a-zA-Z0-9_\-\s]/g, "")
        .trim()
        .replace(/\s+/g, "_") || "Comercial_ZYRVAE";
    const filename = `${cleanName}.mp4`;
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 2000);

    return { url, filename };
  };

  // Conversión infalible de HTML a MP4 (Nube Directa -> API Proxy -> Motor Integrado en Navegador)
  const handleRenderVideo = async () => {
    if (isLoading || !htmlCode.trim()) return;

    setIsLoading(true);
    setFeedback(null);
    setProgressPercent(8);
    setProgressStatus("Conectando con el motor de conversión MP4...");

    const safeTitle = htmlTitle.trim() || "Comercial_ZYRVAE";
    const requestPayload = {
      mode: "html",
      html: htmlCode,
      title: safeTitle,
      duration: durationSeconds,
      fps: 24,
      width: dimensions.width,
      height: dimensions.height,
      cleanVideo: cleanVideoMode,
      download: true,
    };

    // Simulador de progreso suave mientras el servidor en la nube procesa el video
    let progressInterval: ReturnType<typeof setInterval> | null = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 85) return prev;
        return prev + 4;
      });
    }, 700);

    const clearProgressTimer = () => {
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
    };

    try {
      let mp4Blob: Blob | null = null;
      let usedEngine = "Motor Cloud Dedicado (Puppeteer + FFmpeg)";

      // ETAPA 1: Intentar llamada directa por CORS al microservicio (evita límites de timeout de Vercel)
      const targetCloudUrl = (rendererUrl || DEFAULT_RENDERER_URL).replace(/\/$/, "");
      try {
        setProgressStatus("Renderizando fotogramas HTML en servidor Cloud...");
        const directRes = await fetch(`${targetCloudUrl}/render`, {
          method: "POST",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Accept: "video/mp4, application/json",
          },
          body: JSON.stringify(requestPayload),
          signal: AbortSignal.timeout(40000),
        });

        const directType = directRes.headers.get("content-type") || "";
        if (directRes.ok && (directType.includes("video/mp4") || directType.includes("octet-stream"))) {
          mp4Blob = await directRes.blob();
          usedEngine = "Motor Cloud Dedicado (HTML → MP4 Directo)";
        }
      } catch (directErr) {
        console.warn("[Conversor MP4] Aviso en conexión directa cloud, probando ruta API:", directErr);
      }

      // ETAPA 2: Si la llamada directa no devolvió el MP4, intentar vía /api/render
      if (!mp4Blob) {
        try {
          setProgressStatus("Procesando video a través de la API...");
          const apiRes = await fetch("/api/render", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestPayload),
            signal: AbortSignal.timeout(42000),
          });

          const apiType = apiRes.headers.get("content-type") || "";
          if (apiRes.ok && (apiType.includes("video/mp4") || apiType.includes("octet-stream"))) {
            mp4Blob = await apiRes.blob();
            usedEngine = "Servidor Cloud de Video MP4";
          }
        } catch (apiErr) {
          console.warn("[Conversor MP4] Aviso en API /api/render, activando motor local:", apiErr);
        }
      }

      // ETAPA 3: Si el servidor en la nube está reiniciando o en mantenimiento, convertir en el navegador
      if (!mp4Blob || mp4Blob.size < 500) {
        clearProgressTimer();
        usedEngine = "Motor MP4 Integrado en Navegador (Instantáneo)";
        mp4Blob = await renderHtmlToMp4InBrowser({
          html: htmlCode,
          durationSeconds,
          width: dimensions.width,
          height: dimensions.height,
          cleanVideo: cleanVideoMode,
          onProgress: (pct, statusText) => {
            setProgressPercent(pct);
            setProgressStatus(statusText);
          },
        });
      }

      clearProgressTimer();
      setProgressPercent(100);
      setProgressStatus("¡Descargando archivo MP4!");

      const { url, filename } = triggerMp4Download(mp4Blob, safeTitle);
      const durText = durationSeconds === 60 ? "1 minuto (60s)" : `${durationSeconds} segundos`;

      setFeedback({
        type: "success",
        message: `¡Tu código HTML fue convertido a MP4 (${durText}) con éxito! La descarga de "${filename}" ha comenzado automáticamente.`,
        engine: usedEngine,
        downloadUrl: url,
        filename,
      });
      setShowResultModal(true);
    } catch (err: unknown) {
      clearProgressTimer();
      console.error("Error al convertir a MP4:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedback({
        type: "error",
        message: "Ocurrió un inconveniente al generar el archivo MP4.",
        details: errorMsg,
      });
      setShowResultModal(true);
    } finally {
      clearProgressTimer();
      setIsLoading(false);
      setProgressPercent(0);
      setProgressStatus("");
    }
  };

  return (
    <div className="px-3 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8 max-w-7xl mx-auto space-y-5 md:space-y-8">
      {/* Encabezado limpio y enfocado en Conversión HTML -> MP4 */}
      <div className="flex flex-col gap-4 pb-5 border-b border-zinc-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
              <Link
                href="/library"
                className="hover:text-zinc-200 transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Biblioteca
              </Link>
              <span>/</span>
              <span className="text-zinc-200 font-medium">Convertidor HTML a MP4</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Clapperboard className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-400" />
              Convertidor de HTML a Video MP4
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Pega tu código HTML/CSS y descárgalo directamente como video .MP4 vertical (9:16).
            </p>
          </div>

          {/* Plantillas Rápidas de Código HTML */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => {
                const code = createSampleAdHtml(durationSeconds);
                setHtmlCode(code);
                setDebouncedHtml(code);
                setHtmlTitle("Comercial_ZYRVAE");
              }}
              className="h-8 text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Plantilla ZYRVAE
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => {
                const code = createFlashSaleHtml(durationSeconds);
                setHtmlCode(code);
                setDebouncedHtml(code);
                setHtmlTitle("Oferta_Flash_ZYRVAE");
              }}
              className="h-8 text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5"
            >
              <Zap className="h-3.5 w-3.5 text-rose-400" />
              Plantilla Oferta Flash
            </Button>
          </div>
        </div>

        {/* Barra móvil para alternar entre "Código HTML" y "Vista Previa" */}
        <div className="lg:hidden flex items-center bg-zinc-900/95 p-1 rounded-xl border border-zinc-800 shadow-md sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-30 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              mobileTab === "editor"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Code2 className="h-4 w-4" />
            Pegar Código HTML
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              mobileTab === "preview"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            Vista Previa 9:16
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Layout Principal de Dos Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Columna Izquierda: Editor de Código HTML y Conversión */}
        <div
          className={`lg:col-span-7 space-y-5 ${
            mobileTab === "editor" ? "block" : "hidden lg:block"
          }`}
        >
          {/* Card del Editor de Código HTML */}
          <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div>
                  <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                    <FileCode2 className="h-4 w-4 text-indigo-400" />
                    1. Pega tu Código HTML / CSS
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400 mt-0.5">
                    Pega cualquier documento o bloque HTML. Se convertirá directamente en un archivo .mp4.
                  </CardDescription>
                </div>

                {/* Acciones rápidas del editor */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={handleCopyHtml}
                    className="h-8 text-[11px] border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-zinc-400" />
                        Copiar HTML
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => {
                      setHtmlCode("");
                      setDebouncedHtml("");
                    }}
                    className="h-8 text-[11px] border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 gap-1.5"
                    title="Limpiar editor"
                  >
                    <Trash2 className="h-3 w-3" />
                    Limpiar
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Nombre del archivo MP4 */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Nombre del archivo MP4 a descargar
                </label>
                <Input
                  value={htmlTitle}
                  disabled={isLoading}
                  onChange={(e) => setHtmlTitle(e.target.value)}
                  placeholder="Ej: Comercial_ZYRVAE"
                  className="bg-zinc-950/70 border-zinc-800 text-zinc-100 text-sm focus:border-indigo-500"
                />
              </div>

              {/* Textarea optimizada sin bloqueos */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium text-zinc-300">
                    Código HTML (Resolución base 1080×1920)
                  </label>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {htmlCode.length} caracteres
                  </span>
                </div>
                <textarea
                  rows={14}
                  value={htmlCode}
                  disabled={isLoading}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  placeholder="<!DOCTYPE html><html><head>...</head><body>...</body></html>"
                  spellCheck={false}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 p-3 text-xs sm:text-[13px] font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card de Duración y Botón de Conversión */}
          <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl">
            <CardContent className="pt-5 space-y-4">
              {/* Selector de Duración */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-indigo-400" />
                    2. Elige la Duración del Video MP4
                  </label>
                  <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                    {durationSeconds === 60
                      ? "1 minuto (60s)"
                      : `${durationSeconds} segundos`}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {DURATION_PRESETS.map((item) => (
                    <button
                      key={item.seconds}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleChangeDuration(item.seconds)}
                      className={`py-2.5 px-2.5 rounded-xl border text-center transition-all relative ${
                        durationSeconds === item.seconds
                          ? "bg-indigo-600/20 border-indigo-500/80 text-white font-semibold shadow-sm ring-1 ring-indigo-500/40"
                          : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                      }`}
                    >
                      {item.badge && (
                        <span className="absolute -top-2 right-1.5 bg-emerald-600 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
                          {item.badge}
                        </span>
                      )}
                      <span className="text-xs sm:text-sm font-semibold block">
                        {item.label}
                      </span>
                      <p className="text-[10px] text-zinc-500 leading-tight mt-0.5 truncate">
                        {item.desc}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Duración personalizada */}
                <div className="flex items-center gap-2 pt-1 text-xs text-zinc-400">
                  <span className="text-[11px] text-zinc-400">Otra duración:</span>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    disabled={isLoading}
                    value={durationSeconds}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1 && val <= 120) {
                        handleChangeDuration(val);
                      }
                    }}
                    className="w-16 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-center text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[11px] text-zinc-500">
                    segundos (de 1s a 120s)
                  </span>
                </div>
              </div>

              {/* Formato y Proporción del Video */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-indigo-400" />
                    3. Formato y Resolución
                  </label>
                  <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                    {dimensions.width}×{dimensions.height}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setAspectRatio("9:16")}
                    className={`py-2 px-2 rounded-xl border text-center transition-all ${
                      aspectRatio === "9:16"
                        ? "bg-indigo-600/20 border-indigo-500/80 text-white font-semibold shadow-sm ring-1 ring-indigo-500/40"
                        : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span className="text-xs font-semibold block">9:16 Vertical</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">TikTok / Reels</p>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setAspectRatio("16:9")}
                    className={`py-2 px-2 rounded-xl border text-center transition-all ${
                      aspectRatio === "16:9"
                        ? "bg-indigo-600/20 border-indigo-500/80 text-white font-semibold shadow-sm ring-1 ring-indigo-500/40"
                        : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span className="text-xs font-semibold block">16:9 Horizontal</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">YouTube / Web</p>
                  </button>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => setAspectRatio("1:1")}
                    className={`py-2 px-2 rounded-xl border text-center transition-all ${
                      aspectRatio === "1:1"
                        ? "bg-indigo-600/20 border-indigo-500/80 text-white font-semibold shadow-sm ring-1 ring-indigo-500/40"
                        : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <span className="text-xs font-semibold block">1:1 Cuadrado</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Post Feed</p>
                  </button>
                </div>
              </div>

              {/* Modo Publicación: Video Limpio (Eliminar Paneles y Botones de Reproducir) */}
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={cleanVideoMode}
                    disabled={isLoading}
                    onChange={(e) => setCleanVideoMode(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-zinc-950"
                  />
                  <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    Modo Publicación (Video Limpio sin Paneles)
                  </span>
                </label>
                <p className="text-[11px] text-zinc-400 leading-normal pl-6">
                  Oculta automáticamente barras de control, botones de Play y paneles laterales del código HTML.
                  Activa la reproducción automática de animaciones y videos fotograma a fotograma para que el MP4 quede listo para subir a redes.
                </p>
              </div>

              {/* Barra de Progreso en Vivo durante el Renderizado */}
              {isLoading && (
                <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-indigo-500/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-indigo-300 font-medium flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                      {progressStatus || "Convirtiendo HTML a MP4..."}
                    </span>
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${Math.max(5, progressPercent)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Botón Principal de Conversión y Descarga Directa */}
              <div className="pt-1">
                <Button
                  onClick={handleRenderVideo}
                  disabled={isLoading || !htmlCode.trim()}
                  className="w-full h-12 text-sm font-semibold rounded-xl transition-all shadow-lg gap-2.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/25 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Convirtiendo HTML a MP4 ({durationSeconds}s)...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 text-white fill-white" />
                      Convertir HTML a MP4 y Descargar ({durationSeconds === 60 ? "1 min" : `${durationSeconds}s`})
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-zinc-500 text-center mt-2">
                  Descarga directa del archivo .mp4 en tu dispositivo (H.264 compatible con Reels, TikTok y WhatsApp).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Derecha: Smartphone Mockup con Previsualización en Vivo */}
        <div
          className={`lg:col-span-5 flex flex-col items-center justify-center space-y-3 ${
            mobileTab === "preview" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Barra superior del visor */}
          <div className="w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[340px] flex items-center justify-between px-2 text-xs">
            <span className="font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 text-[11px]">
              <Smartphone className="h-3.5 w-3.5 text-zinc-400" />
              Vista Previa HTML (9:16)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIframeKey((k) => k + 1)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Reiniciar animación"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-zinc-800 text-zinc-400"
              >
                {dimensions.width} × {dimensions.height}
              </Badge>
            </div>
          </div>

          {/* Smartphone Mockup Container */}
          <div
            ref={phoneContainerRef}
            className={`relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[340px] ${
              aspectRatio === "16:9"
                ? "aspect-[16/9] rounded-2xl max-w-[420px]"
                : aspectRatio === "1:1"
                ? "aspect-square rounded-2xl"
                : "aspect-[9/16] rounded-[2.5rem]"
            } p-3 sm:p-3.5 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border-[4px] sm:border-[5px] border-zinc-800 shadow-2xl shadow-black ring-1 ring-zinc-700/50 flex flex-col`}
          >
            {/* Dynamic Island (en 9:16) */}
            {aspectRatio === "9:16" && (
              <div className="absolute top-3.5 sm:top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                <div className="w-20 sm:w-24 h-3.5 sm:h-4 bg-zinc-950 rounded-full border border-zinc-800/80 flex items-center justify-end px-2">
                  <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-zinc-800" />
                </div>
              </div>
            )}

            {/* Pantalla del Mockup */}
            <div className="relative flex-1 rounded-[1.8rem] overflow-hidden bg-zinc-950 border border-zinc-800/80 flex flex-col">
              <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
                {isLoading ? (
                  /* Mientras renderiza, suspendemos el iframe pesado para que la página nunca se trabe */
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                    <p className="text-xs font-semibold text-zinc-200">
                      Generando archivo .MP4 ({progressPercent}%)
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {progressStatus || "Procesando fotogramas..."}
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      width: dimensions.width,
                      height: dimensions.height,
                      transform: `scale(${previewScale})`,
                      transformOrigin: "center center",
                    }}
                    className="shrink-0 pointer-events-auto"
                  >
                    <iframe
                      key={iframeKey}
                      srcDoc={previewHtml || "<body style='background:#09090b;'></body>"}
                      title="Previsualización de Código HTML"
                      sandbox="allow-scripts"
                      style={{ width: dimensions.width, height: dimensions.height }}
                      className="border-0 bg-zinc-950"
                    />
                  </div>
                )}

                {/* Badge flotante indicador HTML LIVE */}
                <div className="absolute top-6 left-3.5 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md text-[10px] text-zinc-300 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {aspectRatio} • {durationSeconds === 60 ? "1 min" : `${durationSeconds}s`}
                  </span>
                </div>
              </div>

              {/* Home bar inferior */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-1 bg-zinc-600/60 rounded-full pointer-events-none z-30" />
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 text-center max-w-[300px] leading-relaxed">
            Vista previa en tiempo real en proporción 9:16 vertical ({durationSeconds === 60 ? "1 min" : `${durationSeconds}s`}).
          </p>
        </div>
      </div>

      {/* Modal de Resultado con Reproductor MP4 Integrado y Botón de Descarga */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl p-5 sm:p-6">
          <DialogHeader>
            <div
              className={`w-12 h-12 rounded-full border flex items-center justify-center mb-2 mx-auto sm:mx-0 ${
                feedback?.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-red-500/10 border-red-500/30 text-red-400"
              }`}
            >
              {feedback?.type === "success" ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
            </div>
            <DialogTitle className="text-base sm:text-lg font-semibold">
              {feedback?.type === "success"
                ? "¡Video MP4 Generado y Descargado!"
                : "Error al generar video"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs leading-relaxed pt-1">
              {feedback?.message}
            </DialogDescription>
          </DialogHeader>

          {feedback?.details && (
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-400 max-h-32 overflow-y-auto">
              {feedback.details}
            </div>
          )}

          {feedback?.type === "success" && (
            <div className="space-y-3">
              {/* Reproductor de video del MP4 recién generado */}
              {feedback.downloadUrl && (
                <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black flex justify-center max-h-56">
                  <video
                    src={feedback.downloadUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="h-52 w-auto object-contain"
                  />
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="text-zinc-400">Archivo:</span>
                  <span className="font-semibold text-white font-mono">
                    {feedback.filename || `${htmlTitle}.mp4`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="text-zinc-400">Motor utilizado:</span>
                  <span className="font-semibold text-indigo-400">
                    {feedback.engine}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="text-zinc-400">Duración:</span>
                  <span className="font-semibold text-white">
                    {durationSeconds === 60 ? "1 minuto (60s)" : `${durationSeconds} segundos`}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowResultModal(false)}
              className="border-zinc-800 hover:bg-zinc-900 text-xs text-zinc-300"
            >
              Cerrar
            </Button>
            {feedback?.type === "success" && feedback?.downloadUrl && (
              <Button
                onClick={() => {
                  if (feedback.downloadUrl) {
                    const a = document.createElement("a");
                    a.href = feedback.downloadUrl;
                    a.download = feedback.filename || "video.mp4";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }
                }}
                className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Volver a Descargar MP4
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
