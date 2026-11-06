"use client";

import * as React from "react";
import Link from "next/link";
import {
  Play,
  Loader2,
  Download,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Smartphone,
  Code2,
  Copy,
  Check,
  Trash2,
  Clock,
  Sparkles,
  Lightbulb,
  HelpCircle,
  FileCode2,
  ArrowLeft,
  Bookmark,
  FolderOpen,
  Film,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { renderHtmlToMp4InBrowser } from "@/lib/browser-mp4-converter";
import { TEMPLATES, AdTemplate, getTemplateById } from "@/lib/templates";
import { saveProject, getSavedProjectById } from "@/lib/user-library";

const DEFAULT_RENDERER_URL =
  process.env.NEXT_PUBLIC_RENDERER_URL || "https://zyrvae-video-renderer.onrender.com";

// Plantilla inicial por defecto
const createSampleAdHtml = (seconds: number = 15) => {
  const tpl = getTemplateById("zyrvae-core");
  return tpl ? tpl.generateHtml(seconds) : "";
};

// Generador de Reglas Técnicas de Renderizado para IAs (ChatGPT, Claude, Gemini, DeepSeek)
export const getTechnicalAiPrompt = (
  durationSec: number = 15,
  aspectRatio: string = "9:16",
  width: number = 1080,
  height: number = 1920
): string => {
  const durationLabel =
    durationSec === 60
      ? "60 segundos (1 minuto)"
      : durationSec > 60
      ? `${durationSec} segundos (~${(durationSec / 60).toFixed(1)} min)`
      : `${durationSec} segundos`;

  return `Actúa como un desarrollador frontend experto en renderizado automatizado de video web.
Genera un ÚNICO archivo HTML autónomo (con CSS y JavaScript embebidos), diseñado específicamente para ser convertido directamente a video MP4 fluido en ZYRVAE Media Studio.

REGLAS TÉCNICAS OBLIGATORIAS PARA EL RENDERIZADO:

1. ARCHIVO 100% AUTÓNOMO Y AUTOCONTENIDO:
   - Todo el CSS debe estar dentro de la etiqueta <style> y cualquier script dentro de <script>.
   - No enlaces archivos locales ni hojas de estilo externas relativas. Todo debe estar embebido en el mismo archivo.

2. CERO INTERACTIVIDAD HUMANA NI CONTROLES DE REPRODUCTOR:
   - El renderizador captura fotogramas de forma automática y desatendida; no hay interacción de un usuario.
   - NO incluyas controles de video, botones de Play/Pause, barras de reproducción web, paneles laterales ni eventos que esperen "click" o "hover".
   - NO uses etiquetas <video> externas que dependan de reproducción manual o de streaming externo inestable.

3. ANIMACIONES CONTINUAS Y AUTOMÁTICAS (CSS @keyframes):
   - Todo el movimiento debe comenzar automáticamente en el segundo 0 (animation-delay: 0s o inmediato).
   - Usa animaciones CSS fluidas (@keyframes) priorizando propiedades aceleradas por GPU (transform: translate, scale, rotate y opacity).
   - El dinamismo visual debe mantenerse activo de principio a fin sin quedarse congelado como una imagen fija.

4. SINCRONIZACIÓN CON LA DURACIÓN DEL VIDEO:
   - Duración total del video configurada: ${durationLabel}.
   - Configura las animaciones, transiciones o bucles para que se sincronicen armónicamente a lo largo de estos ${durationSec} segundos (sin cortarse antes de tiempo ni frenarse).

5. FORMATO, RESOLUCIÓN Y ENCUADRE:
   - Proporción seleccionada: ${aspectRatio} (${width}px de ancho por ${height}px de alto).
   - Aplica en el CSS base:
     html, body {
       width: 100%;
       height: 100%;
       margin: 0;
       padding: 0;
       overflow: hidden;
       box-sizing: border-box;
     }
   - Esto evita barras de desplazamiento (scroll) o desbordes en el video MP4 final.

============================================================
INFORMACIÓN CREATIVA DEL ANUNCIO (TOTALMENTE A TU ELECCIÓN):
Pega o describe aquí lo que deseas que contenga tu anuncio:
- Tu producto o servicio: [DESCRIBE AQUÍ]
- Tu mensaje o textos clave: [DESCRIBE AQUÍ]
- Tu estilo visual, colores o temática: [DESCRIBE AQUÍ]
============================================================`;
};

const MASTER_AI_PROMPT = getTechnicalAiPrompt(15, "9:16", 1080, 1920);

const DURATION_PRESETS = [
  { seconds: 15, label: "15s", desc: "Reel / Story Rápido", badge: "Más Rápido" },
  { seconds: 30, label: "30s", desc: "Comercial Estándar" },
  { seconds: 60, label: "1 min", desc: "Anuncio Completo" },
];

export default function StudioPage() {
  // Pestaña en vista móvil: "editor" o "preview"
  const [mobileTab, setMobileTab] = React.useState<"editor" | "preview">("editor");

  // Parámetros de salida del video
  const [durationSeconds, setDurationSeconds] = React.useState<number>(15);
  const [aspectRatio, setAspectRatio] = React.useState<"9:16" | "16:9" | "1:1">("9:16");
  const [cleanVideoMode, setCleanVideoMode] = React.useState<boolean>(true);
  const [htmlTitle, setHtmlTitle] = React.useState<string>("Comercial_ZYRVAE");

  // Estado del código HTML y versión debounced para el visor
  const [htmlCode, setHtmlCode] = React.useState<string>(() => createSampleAdHtml(15));
  const [debouncedHtml, setDebouncedHtml] = React.useState<string>(() => createSampleAdHtml(15));
  const [copied, setCopied] = React.useState(false);
  const [savedSuccess, setSavedSuccess] = React.useState(false);
  const [iframeKey, setIframeKey] = React.useState(0);
  const [bannerNotice, setBannerNotice] = React.useState<string | null>(null);

  // Modales
  const [showPromptModal, setShowPromptModal] = React.useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = React.useState(false);
  const [copiedPrompt, setCopiedPrompt] = React.useState(false);
  const [showResultModal, setShowResultModal] = React.useState(false);

  // URL del microservicio de renderizado
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

  // Cargar plantilla o proyecto desde query params al montar la página
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const templateParam = params.get("template");
    const projectParam = params.get("projectId");
    const titleParam = params.get("title");

    if (templateParam) {
      const tpl = getTemplateById(templateParam);
      if (tpl) {
        const code = tpl.generateHtml(tpl.defaultDuration);
        setHtmlCode(code);
        setDebouncedHtml(code);
        setHtmlTitle(tpl.name.replace(/\s+/g, "_"));
        setDurationSeconds(tpl.defaultDuration);
        setAspectRatio(tpl.aspectRatio);
        setBannerNotice(`Plantilla cargada: "${tpl.name}"`);
        setTimeout(() => setBannerNotice(null), 4000);
      }
    } else if (projectParam) {
      const proj = getSavedProjectById(projectParam);
      if (proj) {
        setHtmlCode(proj.htmlCode);
        setDebouncedHtml(proj.htmlCode);
        setHtmlTitle(proj.title);
        setDurationSeconds(proj.durationSeconds || 15);
        setAspectRatio(proj.aspectRatio || "9:16");
        setBannerNotice(`Proyecto cargado: "${proj.title}"`);
        setTimeout(() => setBannerNotice(null), 4000);
      }
    } else if (titleParam) {
      setHtmlTitle(titleParam.replace(/\s+/g, "_"));
    }
  }, []);

  // Prompt técnico sincronizado con la duración y dimensiones seleccionadas actualmente
  const dynamicAiPrompt = React.useMemo(() => {
    return getTechnicalAiPrompt(
      durationSeconds,
      aspectRatio,
      dimensions.width,
      dimensions.height
    );
  }, [durationSeconds, aspectRatio, dimensions.width, dimensions.height]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(dynamicAiPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (err) {
      console.error("Error al copiar prompt:", err);
    }
  };

  // Detector de animaciones CSS continuas en el código
  const hasAnimations = React.useMemo(() => {
    if (!debouncedHtml.trim()) return true;
    return /@keyframes|animation\s*:|requestAnimationFrame/i.test(debouncedHtml);
  }, [debouncedHtml]);

  // Referencia y escala para el iframe HTML responsivo
  const phoneContainerRef = React.useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = React.useState<number>(0.26);

  // HTML limpio para vista previa sin paneles interactivos
  const previewHtml = React.useMemo(() => {
    if (!cleanVideoMode) return debouncedHtml;
    const hasKeyframes = /@keyframes/i.test(debouncedHtml);
    const autoMotion = !hasKeyframes
      ? `@keyframes __zyrvae_cinematic_motion {
          0% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.04) translateY(-8px); }
          100% { transform: scale(1.08) translateY(0); }
        }
        img, .bg, .hero, .card, .main, [class*="card"], [class*="hero"], [class*="poster"], [class*="banner"] {
          animation: __zyrvae_cinematic_motion ${durationSeconds}s ease-in-out infinite alternate !important;
        }`
      : "";

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
      ${autoMotion}
    </style>`;
    if (debouncedHtml.includes("<head>")) {
      return debouncedHtml.replace("<head>", `<head>${cleanStyle}`);
    }
    return `${cleanStyle}${debouncedHtml}`;
  }, [debouncedHtml, cleanVideoMode, durationSeconds]);

  // Debounce del HTML para la vista previa
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedHtml(htmlCode);
    }, 350);
    return () => clearTimeout(timer);
  }, [htmlCode]);

  // Precalentar servidor en la nube de fondo
  React.useEffect(() => {
    let active = true;
    const warmUpEngines = async () => {
      try {
        const res = await fetch("/api/render", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (active && data?.rendererUrl) {
          setRendererUrl(String(data.rendererUrl).replace(/\/$/, ""));
        }
      } catch {}

      try {
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

  // Cargar una plantilla oficial
  const handleSelectTemplate = (tpl: AdTemplate) => {
    const code = tpl.generateHtml(tpl.defaultDuration);
    setHtmlCode(code);
    setDebouncedHtml(code);
    setHtmlTitle(tpl.name.replace(/\s+/g, "_"));
    setDurationSeconds(tpl.defaultDuration);
    setAspectRatio(tpl.aspectRatio);
    setShowTemplatesModal(false);
    setBannerNotice(`Plantilla cargada: "${tpl.name}"`);
    setTimeout(() => setBannerNotice(null), 3500);
  };

  // Guardar proyecto en Biblioteca local
  const handleSaveProject = () => {
    try {
      saveProject({
        title: htmlTitle || "Mi Anuncio ZYRVAE",
        htmlCode,
        durationSeconds,
        aspectRatio,
        type: "draft",
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error("Error al guardar proyecto:", err);
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

  // Conversión infalible de HTML a MP4
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

      // ETAPA 1: Llamada directa Cloud
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
        console.warn("[Conversor MP4] Aviso en llamada directa, pasando a API proxy:", directErr);
      }

      // ETAPA 2: Proxy API
      if (!mp4Blob) {
        try {
          setProgressStatus("Procesando video a través de la API proxy...");
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
          console.warn("[Conversor MP4] Aviso en API proxy, activando motor local de respaldo:", apiErr);
        }
      }

      // ETAPA 3: Motor local de navegador
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

      // Guardar automáticamente en la Biblioteca local
      try {
        saveProject({
          title: safeTitle,
          htmlCode,
          durationSeconds,
          aspectRatio,
          type: "rendered",
        });
      } catch {}

      setFeedback({
        type: "success",
        message: `¡Tu código fue convertido a MP4 (${durText}) con éxito! La descarga de "${filename}" comenzó automáticamente.`,
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
    <div className="px-3 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8 max-w-7xl mx-auto space-y-5 md:space-y-6">
      {/* ========================================================= */}
      {/* BARRA SUPERIOR: ENCABEZADO Y ACCIONES PRINCIPALES         */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-3.5 pb-4 border-b border-zinc-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
              <Link
                href="/library"
                className="hover:text-zinc-200 transition-colors flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Biblioteca de Plantillas
              </Link>
              <span>/</span>
              <span className="text-zinc-300">Estudio de Video MP4</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Film className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-400" />
              Estudio de Video HTML a MP4
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Crea o pega tu código con animaciones CSS y expórtalo a video .MP4 listo para publicar.
            </p>
          </div>

          {/* Barra de Acciones Globales del Estudio */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Botón: Cargar Plantilla */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTemplatesModal(true)}
              className="h-8 text-xs border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-semibold gap-1.5 shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Cargar Plantilla
            </Button>

            {/* Botón: Reglas Técnicas IA */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPromptModal(true)}
              className="h-8 text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium gap-1.5"
            >
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
              Reglas para IA ({durationSeconds === 60 ? "1 min" : `${durationSeconds}s`})
            </Button>

            {/* Botón: Guardar Proyecto */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveProject}
              className="h-8 text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5"
              title="Guardar proyecto en tu biblioteca local"
            >
              {savedSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ¡Guardado!
                </>
              ) : (
                <>
                  <Bookmark className="h-3.5 w-3.5 text-zinc-400" />
                  Guardar
                </>
              )}
            </Button>

            {/* Ir a Biblioteca */}
            <Link href="/library">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 gap-1.5"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Biblioteca
              </Button>
            </Link>
          </div>
        </div>

        {/* Notificación si se cargó una plantilla o proyecto */}
        {bannerNotice && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 animate-in fade-in slide-in-from-top-1">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              {bannerNotice}
            </span>
            <button
              onClick={() => setBannerNotice(null)}
              className="text-emerald-400 hover:text-emerald-200 text-xs px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Barra móvil para alternar entre "Código HTML" y "Vista Previa" */}
        <div className="lg:hidden flex items-center bg-zinc-900/95 p-1 rounded-xl border border-zinc-800 shadow-md sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-30 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setMobileTab("editor")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              mobileTab === "editor"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Code2 className="h-4 w-4" />
            Editor & Ajustes
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              mobileTab === "preview"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            Vista Previa {aspectRatio}
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CUERPO PRINCIPAL: 2 COLUMNAS (EDITOR + VISOR EN VIVO)     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* COLUMNA IZQUIERDA: FLUJO SECUENCIAL 1-2-3 */}
        <div
          className={`lg:col-span-7 space-y-4 ${
            mobileTab === "editor" ? "block" : "hidden lg:block"
          }`}
        >
          {/* PASO 1: CONFIGURACIÓN DE SALIDA (DURACIÓN & FORMATO) */}
          <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                    1
                  </span>
                  Configuración del Video MP4
                </CardTitle>
                <span className="text-[11px] font-mono text-zinc-400">
                  {dimensions.width}×{dimensions.height} • {durationSeconds}s
                </span>
              </div>
            </CardHeader>

            <CardContent className="px-4 sm:px-5 pb-4 pt-0 space-y-4">
              {/* Nombre del archivo */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-300">
                  Nombre del archivo de video (.mp4)
                </label>
                <Input
                  value={htmlTitle}
                  disabled={isLoading}
                  onChange={(e) => setHtmlTitle(e.target.value)}
                  placeholder="Ej: Comercial_ZYRVAE"
                  className="h-8 sm:h-9 bg-zinc-950/70 border-zinc-800 text-zinc-100 text-xs sm:text-sm focus:border-indigo-500 rounded-xl"
                />
              </div>

              {/* Grid 2 columnas: Duración y Formato */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Duración */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-medium text-zinc-300 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-400" />
                      Duración del Video
                    </label>
                    <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                      {durationSeconds === 60 ? "1 min" : `${durationSeconds}s`}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {DURATION_PRESETS.map((preset) => (
                      <button
                        key={preset.seconds}
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleChangeDuration(preset.seconds)}
                        className={`py-2 px-1.5 rounded-xl border text-center transition-all ${
                          durationSeconds === preset.seconds
                            ? "bg-indigo-600/25 border-indigo-500 text-white font-semibold ring-1 ring-indigo-500/50"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        }`}
                      >
                        <span className="text-xs font-bold block">{preset.label}</span>
                        <span className="text-[9px] text-zinc-500 block truncate">
                          {preset.desc.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Duración custom */}
                  <div className="flex items-center gap-2 pt-0.5 text-xs text-zinc-400">
                    <span className="text-[11px] text-zinc-400">Personalizado:</span>
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
                      className="w-14 px-2 py-0.5 bg-zinc-950 border border-zinc-800 rounded-lg text-center text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-[11px] text-zinc-500">seg (1-120s)</span>
                  </div>
                </div>

                {/* Formato / Aspect Ratio */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-medium text-zinc-300 flex items-center gap-1.5">
                      <Smartphone className="h-3.5 w-3.5 text-indigo-400" />
                      Proporción & Formato
                    </label>
                    <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                      {aspectRatio}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setAspectRatio("9:16")}
                      className={`py-2 px-1 rounded-xl border text-center transition-all ${
                        aspectRatio === "9:16"
                          ? "bg-indigo-600/25 border-indigo-500 text-white font-semibold ring-1 ring-indigo-500/50"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-xs font-bold block">9:16</span>
                      <span className="text-[9px] text-zinc-500 block">Reels/TikTok</span>
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setAspectRatio("16:9")}
                      className={`py-2 px-1 rounded-xl border text-center transition-all ${
                        aspectRatio === "16:9"
                          ? "bg-indigo-600/25 border-indigo-500 text-white font-semibold ring-1 ring-indigo-500/50"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-xs font-bold block">16:9</span>
                      <span className="text-[9px] text-zinc-500 block">YouTube</span>
                    </button>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setAspectRatio("1:1")}
                      className={`py-2 px-1 rounded-xl border text-center transition-all ${
                        aspectRatio === "1:1"
                          ? "bg-indigo-600/25 border-indigo-500 text-white font-semibold ring-1 ring-indigo-500/50"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span className="text-xs font-bold block">1:1</span>
                      <span className="text-[9px] text-zinc-500 block">Cuadrado</span>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PASO 2: CÓDIGO HTML / CSS DEL ANUNCIO */}
          <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl rounded-2xl">
            <CardHeader className="pb-2.5 pt-4 px-4 sm:px-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div>
                  <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                      2
                    </span>
                    Código HTML / CSS del Anuncio
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400 mt-0.5">
                    El código debe ser autónomo y contener animaciones CSS (@keyframes).
                  </CardDescription>
                </div>

                {/* Acciones del editor */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => setShowTemplatesModal(true)}
                    className="h-7 text-[11px] border-zinc-800 hover:bg-zinc-800 text-indigo-300 gap-1.5"
                  >
                    <Sparkles className="h-3 w-3" />
                    Plantillas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={handleCopyHtml}
                    className="h-7 text-[11px] border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-zinc-400" />
                        Copiar
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
                    className="h-7 text-[11px] border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 gap-1"
                    title="Limpiar código"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-4 sm:px-5 pb-4 space-y-3">
              {/* Textarea optimizada */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-zinc-400">
                    Documento HTML integrado:
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {htmlCode.length} caracteres
                  </span>
                </div>
                <textarea
                  rows={13}
                  value={htmlCode}
                  disabled={isLoading}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  placeholder="<!DOCTYPE html><html><head>...</head><body>...</body></html>"
                  spellCheck={false}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 p-3 text-xs sm:text-[13px] font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y leading-relaxed"
                />

                {/* Detector de Animación Contextual */}
                {!hasAnimations && debouncedHtml.trim() && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-3 text-xs text-amber-200 mt-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <p className="font-semibold text-amber-300">
                          Aviso: Este código no contiene animaciones continuas (@keyframes)
                        </p>
                        <p className="text-zinc-300 mt-0.5 text-[11px] leading-relaxed">
                          Para que el video MP4 tenga movimiento continuo durante los{" "}
                          {durationSeconds === 60 ? "60 segundos" : `${durationSeconds} segundos`} sin
                          quedar congelado, debe incluir animaciones CSS automáticas.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setShowPromptModal(true)}
                      className="shrink-0 h-7 text-[11px] border-amber-500/40 text-amber-300 hover:bg-amber-500/20"
                    >
                      Ver Reglas Técnicas
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* PASO 3: EXPORTACIÓN Y CONVERSIÓN A MP4 */}
          <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl rounded-2xl">
            <CardContent className="pt-4 px-4 sm:px-5 pb-5 space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                    3
                  </span>
                  Exportar a Video MP4
                </CardTitle>
                <span className="text-[11px] text-zinc-400 font-mono">
                  {durationSeconds === 60 ? "1 min" : `${durationSeconds}s`} • H.264
                </span>
              </div>

              {/* Modo Publicación Limpio */}
              <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="cleanVideoCheckbox"
                  checked={cleanVideoMode}
                  disabled={isLoading}
                  onChange={(e) => setCleanVideoMode(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="cleanVideoCheckbox"
                  className="text-xs cursor-pointer select-none space-y-0.5"
                >
                  <span className="font-semibold text-zinc-200 block">
                    Modo Publicación Limpio (Ocultar botones de reproducción web)
                  </span>
                  <span className="text-[11px] text-zinc-400 block leading-normal">
                    Elimina automáticamente botones de Play/Pause y paneles laterales para que el archivo .MP4 quede limpio y profesional.
                  </span>
                </label>
              </div>

              {/* Barra de Progreso en Vivo */}
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

              {/* Botón Principal de Conversión */}
              <div>
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
                  Descarga directa del archivo MP4 en resolución {dimensions.width}×{dimensions.height} compatible con TikTok, Reels y WhatsApp.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUMNA DERECHA: MOCKUP DE DISPOSITIVO / PREVISUALIZACIÓN */}
        <div
          className={`lg:col-span-5 flex flex-col items-center justify-center space-y-3 ${
            mobileTab === "preview" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Barra superior del visor */}
          <div className="w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[340px] flex items-center justify-between px-2 text-xs">
            <span className="font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 text-[11px]">
              <Smartphone className="h-3.5 w-3.5 text-indigo-400" />
              Vista Previa en Vivo
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIframeKey((k) => k + 1)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Reiniciar animación"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-zinc-800 text-zinc-400"
              >
                {dimensions.width}×{dimensions.height}
              </Badge>
            </div>
          </div>

          {/* Smartphone / Screen Container */}
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
            {/* Dynamic Island en 9:16 */}
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
            El archivo de video final se grabará fotograma a fotograma exactamente como se ve en esta previsualización.
          </p>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: SELECTOR RÁPIDO DE PLANTILLAS OFICIALES            */}
      {/* ========================================================= */}
      <Dialog open={showTemplatesModal} onOpenChange={setShowTemplatesModal}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-white">
                  Cargar Plantilla Animada
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-xs">
                  Selecciona una plantilla prediseñada para cargarla en el editor con 1 clic.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-3">
            {TEMPLATES.map((tpl) => (
              <div
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl)}
                className="group p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900 hover:border-indigo-500/60 transition-all cursor-pointer flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-indigo-400 font-semibold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {tpl.category}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      {tpl.defaultDuration}s • 9:16
                    </span>
                  </div>
                  <h4 className="font-bold text-zinc-100 group-hover:text-white transition-colors text-sm mt-2">
                    {tpl.name}
                  </h4>
                  <p className="text-zinc-400 text-xs line-clamp-2 mt-1">
                    {tpl.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-indigo-400 font-semibold">
                  <span>Cargar en el Estudio</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="flex-row items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
            <Link href="/library" onClick={() => setShowTemplatesModal(false)}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-zinc-800 text-zinc-300 hover:text-white text-xs gap-1.5"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                Ver Todas en la Biblioteca
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTemplatesModal(false)}
              className="border-zinc-800 text-zinc-400 hover:text-white text-xs"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: REGLAS TÉCNICAS DE RENDERIZADO PARA IA             */}
      {/* ========================================================= */}
      <Dialog open={showPromptModal} onOpenChange={setShowPromptModal}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-xl bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                <Lightbulb className="h-5 w-5 text-amber-400" />
              </span>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-white">
                  Reglas Técnicas para IAs ({durationSeconds === 60 ? "1 min (60s)" : `${durationSeconds}s`} · {aspectRatio})
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-xs">
                  Instrucciones técnicas indispensables para que ChatGPT, Claude o tu IA generen código que se renderice a video MP4 fluido.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3.5 my-2">
            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-zinc-300 space-y-1.5">
              <p className="font-semibold text-indigo-300 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-indigo-400" />
                Libertad creativa + Precisión técnica
              </p>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Este prompt <strong className="text-zinc-200">no te impone cómo debe ser tu anuncio</strong> (el guion, estética, temática y producto los decides tú libremente). Establece las <strong className="text-indigo-300">reglas técnicas de renderizado</strong> para que el motor de video pueda exportar un MP4 animado de <strong className="text-white">{durationSeconds === 60 ? "1 minuto (60s)" : `${durationSeconds} segundos`}</strong> sin controles de reproductor ni fotos fijas.
              </p>
            </div>

            {/* Selector rápido de duración dentro del modal */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs">
              <span className="text-zinc-400 font-medium">Sincronizado con duración:</span>
              <div className="flex items-center gap-1.5">
                {DURATION_PRESETS.map((preset) => (
                  <button
                    key={preset.seconds}
                    type="button"
                    onClick={() => handleChangeDuration(preset.seconds)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      durationSeconds === preset.seconds
                        ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-500/50"
                        : "bg-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 font-medium">Reglas listas para copiar a tu IA:</span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {aspectRatio} · {durationSeconds === 60 ? "1 min" : `${durationSeconds}s`}
                </span>
              </div>
              <pre className="p-4 rounded-xl bg-black/90 border border-zinc-800 text-zinc-200 text-[11px] sm:text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto select-all">
                {dynamicAiPrompt}
              </pre>
            </div>
          </div>

          <DialogFooter className="flex-row items-center justify-between gap-2 pt-2 border-t border-zinc-800/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPromptModal(false)}
              className="border-zinc-800 text-zinc-400 hover:text-white"
            >
              Cerrar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCopyPrompt}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 font-medium"
            >
              {copiedPrompt ? (
                <>
                  <Check className="h-4 w-4 text-emerald-300" />
                  ¡Reglas Copiadas!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copiar Reglas Técnicas
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL DE RESULTADO: REPRODUCTOR MP4 Y DESCARGA            */}
      {/* ========================================================= */}
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
              {feedback.downloadUrl && (
                <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black flex justify-center max-h-56">
                  <video
                    src={feedback.downloadUrl}
                    controls
                    autoPlay
                    loop
                    className="max-h-56 max-w-full object-contain"
                  />
                </div>
              )}

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                <div className="flex justify-between">
                  <span>Archivo:</span>
                  <span className="font-mono text-zinc-200">{feedback.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resolución:</span>
                  <span className="font-mono text-zinc-200">
                    {dimensions.width}×{dimensions.height} ({aspectRatio})
                  </span>
                </div>
                {feedback.engine && (
                  <div className="flex justify-between">
                    <span>Motor empleado:</span>
                    <span className="font-mono text-emerald-400 text-[11px] truncate max-w-[200px]">
                      {feedback.engine}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex-row items-center justify-between gap-2 pt-2 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowResultModal(false)}
              className="border-zinc-800 text-zinc-400 hover:text-white"
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
