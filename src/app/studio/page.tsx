"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Sparkles,
  Play,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clapperboard,
  ArrowLeft,
  Loader2,
  Download,
  HardDrive,
  Smartphone,
  Palette,
  Type,
  TrendingUp,
  FileCode2,
  Copy,
  Trash2,
  Check,
  Clock,
  Code2,
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
import { CommercialProps, defaultCommercialProps } from "@/remotion/types";

// Importación dinámica lazy del reproductor Remotion (solo se descarga si se activa el modo Remotion)
const RemotionPreviewPlayer = dynamic(
  () => import("@/components/studio/RemotionPreviewPlayer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        <p className="text-xs text-zinc-400">Cargando motor Remotion...</p>
      </div>
    ),
  }
);

// Plantilla HTML de demostración publicitaria vertical 9:16 (sincronizada con duración)
const createSampleAdHtml = (seconds: number = 30) => `<!DOCTYPE html>
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
      opacity: 0.35; filter: blur(90px); animation: float 6s ease-in-out infinite alternate;
    }
    @keyframes float {
      0% { transform: translate(50px, 120px) scale(0.9); }
      100% { transform: translate(320px, 400px) scale(1.2); }
    }
    .badge {
      display: inline-flex; align-items: center; gap: 16px;
      padding: 16px 32px; border-radius: 9999px;
      background: rgba(24, 24, 27, 0.75); border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px); width: fit-content; z-index: 10;
      animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .badge-dot { width: 16px; height: 16px; border-radius: 50%; background: #10b981; box-shadow: 0 0 20px #10b981; }
    .badge-text { font-size: 24px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #f4f4f5; }
    .hero { position: relative; z-index: 10; display: flex; flex-direction: column; gap: 36px; margin: auto 0; }
    .tag { font-size: 32px; font-weight: 800; color: #818cf8; text-transform: uppercase; letter-spacing: 0.2em; }
    .title { font-size: 88px; font-weight: 900; line-height: 1.05; letter-spacing: -0.04em; }
    .title span { background: linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f43f5e 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .desc { font-size: 36px; line-height: 1.45; color: #a1a1aa; max-width: 920px; }
    .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 10px; }
    .stat-card {
      background: rgba(24, 24, 27, 0.65); border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 32px; border-radius: 28px; backdrop-filter: blur(16px);
    }
    .stat-val { font-size: 54px; font-weight: 900; color: #ffffff; }
    .stat-lbl { font-size: 22px; color: #71717a; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 6px; }
    .footer { position: relative; z-index: 10; display: flex; flex-direction: column; gap: 24px; }
    .progress-track { width: 100%; height: 8px; background: rgba(255, 255, 255, 0.1); border-radius: 4px; overflow: hidden; }
    .progress-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #6366f1, #ec4899); box-shadow: 0 0 20px #6366f1; animation: fillProgress ${seconds}s linear infinite; }
    @keyframes fillProgress { 0% { width: 0%; } 100% { width: 100%; } }
    .foot-labels { display: flex; justify-content: space-between; font-size: 24px; color: #71717a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body data-composition-id="main" data-duration="${seconds}" data-width="1080" data-height="1920" data-fps="30" data-no-timeline>
  <div class="canvas">
    <div class="orb"></div>
    <div class="badge">
      <span class="badge-dot"></span>
      <span class="badge-text">ZYRVAE MEDIA STUDIO</span>
    </div>
    <div class="hero">
      <span class="tag">Convertidor HTML a Video</span>
      <h1 class="title">Tu publicidad en código, <span>convertida a MP4</span> al instante.</h1>
      <p class="desc">Imprenta automatizada en resolución Ultra HD 9:16 vertical para reels y TikTok.</p>
      <div class="card-grid">
        <div class="stat-card">
          <div class="stat-val">+300%</div>
          <div class="stat-lbl">Retención Visual</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">1080 × 1920</div>
          <div class="stat-lbl">Vertical Nativo</div>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="progress-track"><div class="progress-fill"></div></div>
      <div class="foot-labels">
        <span>Renderizado a Video</span>
        <span>Ultra HD 9:16</span>
      </div>
    </div>
  </div>
</body>
</html>`;

const COLOR_PRESETS = [
  { name: "Índigo ZYRVAE", hex: "#6366f1" },
  { name: "Esmeralda", hex: "#10b981" },
  { name: "Rosa Neón", hex: "#f43f5e" },
  { name: "Violeta Profundo", hex: "#8b5cf6" },
  { name: "Ámbar Dorado", hex: "#f59e0b" },
  { name: "Cian Eléctrico", hex: "#06b6d4" },
];

const DURATION_PRESETS = [
  { seconds: 15, label: "15s", title: "15 segundos", desc: "Reel / Story" },
  { seconds: 30, label: "30s", title: "30 segundos", desc: "Comercial Estándar", badge: "Recomendado" },
  { seconds: 60, label: "1 min", title: "60 segundos (1 min)", desc: "Anuncio Completo" },
];

export default function StudioPage() {
  // Modo de edición: "html" (pegar HTML) o "remotion" (formulario visual)
  const [mode, setMode] = React.useState<"html" | "remotion">("html");

  // Pestaña en vista móvil: "editor" o "preview"
  const [mobileTab, setMobileTab] = React.useState<"editor" | "preview">("editor");

  // Configuración general compartida: defecto en 30 segundos
  const [durationSeconds, setDurationSeconds] = React.useState<number>(30);
  const [saveDestination, setSaveDestination] = React.useState<"device" | "drive">("device");

  // Estado del código HTML
  const [htmlCode, setHtmlCode] = React.useState<string>(createSampleAdHtml(30));
  const [htmlTitle, setHtmlTitle] = React.useState<string>("Comercial HTML ZYRVAE");
  const [copied, setCopied] = React.useState(false);
  const [iframeKey, setIframeKey] = React.useState(0);

  // Estado de las propiedades del video Remotion
  const [videoProps, setVideoProps] = React.useState<CommercialProps>({
    ...defaultCommercialProps,
  });

  // Estado de carga y modal de resultados
  const [isLoading, setIsLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
    details?: string;
    engine?: string;
    isDirectDownload?: boolean;
    downloadUrl?: string;
    filename?: string;
  } | null>(null);
  const [showResultModal, setShowResultModal] = React.useState(false);

  // Referencia y escala para el iframe HTML responsivo
  const phoneContainerRef = React.useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = React.useState<number>(0.26);

  // Calcular escala para el iframe (1080x1920) según el ancho real de la pantalla simulada
  React.useEffect(() => {
    const updateScale = () => {
      if (phoneContainerRef.current) {
        const width = phoneContainerRef.current.clientWidth;
        if (width > 0) {
          setPreviewScale(width / 1080);
        }
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Cambiar duración y sincronizar con el código HTML si aplica
  const handleChangeDuration = (sec: number) => {
    setDurationSeconds(sec);
    if (htmlCode.includes("fillProgress")) {
      setHtmlCode((prev) =>
        prev
          .replace(/fillProgress\s+\d+s/gi, `fillProgress ${sec}s`)
          .replace(/data-duration=["']\d+["']/gi, `data-duration="${sec}"`)
      );
      setIframeKey((k) => k + 1);
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

  // Cargar ejemplo en modo HTML
  const handleLoadSampleHtml = () => {
    setHtmlCode(createSampleAdHtml(durationSeconds));
    setIframeKey((prev) => prev + 1);
  };

  // Cargar plantillas Remotion con duraciones adecuadas
  const handleLoadTemplateZyrvae = () => {
    setVideoProps({
      title: "Tu publicidad en video, al instante.",
      subtitle: "Imprenta de Video Automatizada",
      description:
        "Diseño premium de alta conversión con tecnología Remotion para anuncios 9:16 Ultra HD.",
      brandName: "ZYRVAE MEDIA STUDIO",
      accentColor: "#6366f1",
      badgeText: "Comercial ZYRVAE",
      statsValue: "+300%",
      statsLabel: "Conversión de Marca",
      callToAction: "Potencia tu Negocio Hoy",
      template: "commercial",
    });
    handleChangeDuration(30);
  };

  const handleLoadTemplateSale = () => {
    setVideoProps({
      title: "Gran Venta Exclusiva de Temporada",
      subtitle: "Oferta por Tiempo Limitado",
      description:
        "Aprovecha hasta un 50% de descuento en todos nuestros servicios antes de que termine el mes.",
      brandName: "ZYRVAE DEALS",
      accentColor: "#f43f5e",
      badgeText: "50% OFF HOY",
      statsValue: "50% OFF",
      statsLabel: "Descuento Directo",
      callToAction: "Comprar con Descuento",
      template: "reel",
    });
    handleChangeDuration(15);
  };

  const handleLoadTemplateSuccess = () => {
    setVideoProps({
      title: "Cómo escalamos las ventas en 30 días",
      subtitle: "Caso de Éxito Comprobado",
      description:
        "Historias reales de negocios que transformaron su presencia digital con comerciales de alto impacto.",
      brandName: "ZYRVAE GROWTH",
      accentColor: "#10b981",
      badgeText: "Caso de Estudio",
      statsValue: "10k+",
      statsLabel: "Nuevos Clientes",
      callToAction: "Conocer el Caso Completo",
      template: "success-case",
    });
    handleChangeDuration(60);
  };

  // Enviar orden de renderizado al motor dedicado (Render/Railway) o fallback
  const handleRenderVideo = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const payload =
        mode === "html"
          ? {
              mode: "html",
              html: htmlCode,
              title: htmlTitle.trim() || "Comercial HTML ZYRVAE",
              duration: `${durationSeconds}`,
              destination: saveDestination,
            }
          : {
              mode: "remotion",
              title: videoProps.title.trim() || "Comercial ZYRVAE",
              duration: `${durationSeconds}`,
              accentColor: videoProps.accentColor,
              props: videoProps,
              destination: saveDestination,
            };

      const response = await fetch("/api/render", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type") || "";

      // Caso A: El servidor devuelve directamente el video binario MP4 (Render.com / Railway)
      if (contentType.includes("video/mp4") || contentType.includes("octet-stream")) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        let filename = `${(mode === "html" ? htmlTitle : videoProps.title) || "Comercial_ZYRVAE"}.mp4`;
        const disposition = response.headers.get("content-disposition");
        if (disposition && disposition.includes("filename=")) {
          const match = disposition.match(/filename="?([^"]+)"?/);
          if (match && match[1]) filename = match[1];
        }
        filename = filename.replace(/[^a-zA-Z0-9_\-\.]/g, "_");

        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
        }, 1500);

        const durText = durationSeconds === 60 ? "1 minuto (60s)" : `${durationSeconds} segundos`;
        setFeedback({
          type: "success",
          message: `¡Video MP4 (${durText}) generado con éxito! La descarga directa ha comenzado automáticamente en tu dispositivo.`,
          isDirectDownload: true,
          downloadUrl: url,
          filename: filename,
          engine: "Render.com / Railway (Microservicio Cloud)",
        });
        setShowResultModal(true);
        return;
      }

      // Caso B: El servidor devuelve JSON (GitHub Actions o respuesta de estado)
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Error al solicitar la conversión a MP4.");
      }

      const durText = durationSeconds === 60 ? "1 minuto (60s)" : `${durationSeconds} segundos`;
      const successMsg =
        saveDestination === "device"
          ? mode === "html"
            ? `¡Conversión de HTML a MP4 (${durText}) iniciada! En unos instantes podrás descargar tu archivo de video.`
            : `¡Renderizado con Remotion (${durText}) iniciado! En breves instantes podrás descargar tu video MP4.`
          : mode === "html"
          ? `¡Conversión de HTML a MP4 (${durText}) iniciada! El video se generará y se guardará en tu Google Drive.`
          : `¡Renderizado con Remotion (${durText}) iniciado! El video se generará y se guardará en tu Google Drive.`;

      setFeedback({
        type: "success",
        message: successMsg,
        engine: data.engine || (mode === "html" ? "Convertidor HTML a MP4" : "Remotion Ultra HD"),
        isDirectDownload: false,
      });
      setShowResultModal(true);
    } catch (err: unknown) {
      console.error("Error al renderizar:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedback({
        type: "error",
        message: "No se pudo iniciar el renderizado a MP4.",
        details: errorMsg,
      });
      setShowResultModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-3 sm:px-6 md:px-10 py-4 sm:py-6 md:py-8 max-w-7xl mx-auto space-y-5 md:space-y-8">
      {/* Header & Breadcrumbs */}
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
              <span className="text-zinc-200 font-medium">Estudio de Creación</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Clapperboard className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-400" />
              Estudio de Video Comercial
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Crea comerciales Ultra HD 9:16 en MP4 (15s, 30s o 1 minuto) con código HTML o plantillas Remotion.
            </p>
          </div>

          {/* Selector de Modo: HTML vs Remotion */}
          <div className="flex items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 w-full sm:w-auto self-start sm:self-auto shadow-md">
            <button
              type="button"
              onClick={() => {
                setMode("html");
                setIframeKey((k) => k + 1);
              }}
              className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === "html"
                  ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/50"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <FileCode2 className="h-3.5 w-3.5" />
              Pegar HTML a MP4
            </button>
            <button
              type="button"
              onClick={() => setMode("remotion")}
              className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === "remotion"
                  ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/50"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Editor Visual Remotion
            </button>
          </div>
        </div>

        {/* Barra móvil para alternar entre "Editor" y "Vista Previa" (Solo en pantallas chicas) */}
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
            Configuración & Código
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
            Vista Previa en Vivo
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout (Responsive) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Columna Izquierda: Editor (HTML o Remotion) */}
        <div
          className={`lg:col-span-7 space-y-6 ${
            mobileTab === "editor" ? "block" : "hidden lg:block"
          }`}
        >
          {mode === "html" ? (
            /* ==============================================================
               MODO 1: PEGAR CÓDIGO HTML A MP4
            ============================================================== */
            <div className="space-y-5">
              {/* Card del Editor de Código HTML */}
              <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                    <div>
                      <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                        <FileCode2 className="h-4 w-4 text-indigo-400" />
                        Código HTML / CSS del Anuncio
                      </CardTitle>
                      <CardDescription className="text-xs text-zinc-400 mt-0.5">
                        Pega tu código HTML y se compilará fotograma por fotograma en un video .mp4 9:16.
                      </CardDescription>
                    </div>

                    {/* Botones de acción rápida en HTML */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleLoadSampleHtml}
                        className="h-8 text-[11px] border-zinc-800 hover:bg-zinc-800 text-zinc-300 gap-1.5"
                      >
                        <Sparkles className="h-3 w-3 text-indigo-400" />
                        Cargar Ejemplo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
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
                            Copiar
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setHtmlCode("");
                          setIframeKey((k) => k + 1);
                        }}
                        className="h-8 text-[11px] border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-red-400 gap-1.5"
                        title="Limpiar código"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Título del Video */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">
                      Título o Identificador del Video
                    </label>
                    <Input
                      value={htmlTitle}
                      onChange={(e) => setHtmlTitle(e.target.value)}
                      placeholder="Ej: Comercial La Fresque 2026"
                      className="bg-zinc-950/70 border-zinc-800 text-zinc-100 text-sm focus:border-indigo-500"
                    />
                  </div>

                  {/* Textarea de Código HTML */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-medium text-zinc-300">
                        Pega aquí tu código HTML (1080×1920)
                      </label>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {htmlCode.length} caracteres
                      </span>
                    </div>
                    <textarea
                      rows={14}
                      value={htmlCode}
                      onChange={(e) => {
                        setHtmlCode(e.target.value);
                        setIframeKey((k) => k + 1);
                      }}
                      placeholder="<!DOCTYPE html><html><head>...</head><body>...</body></html>"
                      spellCheck={false}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 text-xs sm:text-[13px] font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-y leading-relaxed"
                    />
                    <p className="text-[11px] text-zinc-500">
                      💡 Tip: Puedes usar CSS animations, SVG o GSAP. El motor renderiza en resolución nativa vertical 1080×1920 a 30fps.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Parámetros: Duración y Destino de Guardado */}
              <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl">
                <CardContent className="pt-5 space-y-4">
                  {/* Selector de Duración (15s, 30s o 1 minuto + personalizado) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-zinc-400" />
                        Duración del Video a Generar
                      </label>
                      <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                        {durationSeconds === 60
                          ? "1 minuto (60s)"
                          : `${durationSeconds} segundos`}{" "}
                        • {durationSeconds * 30} frames
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {DURATION_PRESETS.map((item) => (
                        <button
                          key={item.seconds}
                          type="button"
                          onClick={() => handleChangeDuration(item.seconds)}
                          className={`py-2 px-2.5 rounded-xl border text-center transition-all relative ${
                            durationSeconds === item.seconds
                              ? "bg-indigo-600/20 border-indigo-500/80 text-white font-semibold shadow-sm ring-1 ring-indigo-500/40"
                              : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                          }`}
                        >
                          {item.badge && (
                            <span className="absolute -top-2 right-1.5 bg-indigo-500 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
                              {item.badge}
                            </span>
                          )}
                          <span className="text-xs sm:text-sm font-semibold block">{item.label}</span>
                          <p className="text-[10px] text-zinc-500 leading-tight mt-0.5 truncate">{item.desc}</p>
                        </button>
                      ))}
                    </div>

                    {/* Selector de Duración Personalizada */}
                    <div className="flex items-center gap-2 pt-1 text-xs text-zinc-400">
                      <span className="text-[11px] text-zinc-400">Personalizado:</span>
                      <input
                        type="number"
                        min={3}
                        max={120}
                        value={durationSeconds}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1 && val <= 120) {
                            handleChangeDuration(val);
                          }
                        }}
                        className="w-16 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-center text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-[11px] text-zinc-500">segundos (soporta de 3s hasta 120s / 2 min)</span>
                    </div>
                  </div>

                  {/* Selector de Destino de Guardado */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                      <span>Destino de Guardado del Video MP4</span>
                      <span className="text-[11px] text-zinc-400 font-normal">
                        {saveDestination === "device" ? "📱 Descarga Directa" : "☁️ Google Drive"}
                      </span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => setSaveDestination("device")}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                          saveDestination === "device"
                            ? "bg-indigo-600/20 border-indigo-500/80 text-white shadow-sm ring-1 ring-indigo-500/40"
                            : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        }`}
                      >
                        <Download
                          className={`h-4 w-4 mt-0.5 shrink-0 ${
                            saveDestination === "device" ? "text-indigo-400" : "text-zinc-500"
                          }`}
                        />
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-zinc-200">En mi dispositivo</p>
                          <p className="text-[10px] text-zinc-400 leading-tight">
                            Descarga directa del archivo .mp4
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => setSaveDestination("drive")}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                          saveDestination === "drive"
                            ? "bg-indigo-600/20 border-indigo-500/80 text-white shadow-sm ring-1 ring-indigo-500/40"
                            : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        }`}
                      >
                        <HardDrive
                          className={`h-4 w-4 mt-0.5 shrink-0 ${
                            saveDestination === "drive" ? "text-emerald-400" : "text-zinc-500"
                          }`}
                        />
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-zinc-200">En Google Drive</p>
                          <p className="text-[10px] text-zinc-400 leading-tight">
                            Guardado en la nube y Biblioteca
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Botón Principal de Renderizado para HTML */}
                  <div className="pt-2">
                    <Button
                      onClick={handleRenderVideo}
                      disabled={isLoading || !htmlCode.trim()}
                      className="w-full h-12 text-sm font-semibold rounded-xl transition-all shadow-lg gap-2.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/25 active:scale-[0.99]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          Generando Video MP4 en la Nube ({durationSeconds}s)...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 text-white fill-white" />
                          Generar Video MP4 ({durationSeconds === 60 ? "1 min" : `${durationSeconds}s`})
                        </>
                      )}
                    </Button>
                    <p className="text-[11px] text-zinc-500 text-center mt-2">
                      El código HTML se procesa en resolución nativa vertical 1080×1920 a 30fps.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* ==============================================================
               MODO 2: FORMULARIO VISUAL REMOTION
            ============================================================== */
            <div className="space-y-5">
              {/* Plantillas predefinidas */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadTemplateZyrvae}
                  className="border-zinc-800 hover:bg-zinc-800 text-xs gap-1.5 text-zinc-300"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  Comercial ZYRVAE (30s)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadTemplateSale}
                  className="border-zinc-800 hover:bg-zinc-800 text-xs gap-1.5 text-zinc-300"
                >
                  <Sparkles className="h-3.5 w-3.5 text-rose-400" />
                  Oferta Flash (15s)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadTemplateSuccess}
                  className="border-zinc-800 hover:bg-zinc-800 text-xs gap-1.5 text-zinc-300"
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  Caso de Éxito (1 min)
                </Button>
              </div>

              {/* Textos y Mensaje Comercial */}
              <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                    <Type className="h-4 w-4 text-indigo-400" />
                    Textos y Mensaje Comercial
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400">
                    Los textos se sincronizan en vivo en la previsualización Remotion.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">
                      Título Principal del Anuncio
                    </label>
                    <Input
                      value={videoProps.title}
                      onChange={(e) => setVideoProps({ ...videoProps, title: e.target.value })}
                      placeholder="Ej: Tu publicidad en video, al instante."
                      className="bg-zinc-950/70 border-zinc-800 text-zinc-100 text-sm focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300">Subtítulo / Categoría</label>
                      <Input
                        value={videoProps.subtitle}
                        onChange={(e) => setVideoProps({ ...videoProps, subtitle: e.target.value })}
                        placeholder="Ej: Imprenta de Video"
                        className="bg-zinc-950/70 border-zinc-800 text-zinc-100 text-xs focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300">Nombre de Marca (Badge)</label>
                      <Input
                        value={videoProps.brandName}
                        onChange={(e) => setVideoProps({ ...videoProps, brandName: e.target.value })}
                        placeholder="Ej: ZYRVAE MEDIA STUDIO"
                        className="bg-zinc-950/70 border-zinc-800 text-zinc-100 text-xs focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">
                      Descripción o Mensaje Secundario
                    </label>
                    <textarea
                      rows={3}
                      value={videoProps.description}
                      onChange={(e) => setVideoProps({ ...videoProps, description: e.target.value })}
                      placeholder="Escribe el mensaje publicitario de tu marca..."
                      className="w-full rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Métricas, CTA y Color */}
              <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    Métricas, CTA y Color de Marca
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300">Dato Destacado</label>
                      <Input
                        value={videoProps.statsValue}
                        onChange={(e) => setVideoProps({ ...videoProps, statsValue: e.target.value })}
                        placeholder="Ej: +300% o 50% OFF"
                        className="bg-zinc-950/70 border-zinc-800 text-zinc-100 text-xs focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300">Etiqueta del Dato</label>
                      <Input
                        value={videoProps.statsLabel}
                        onChange={(e) => setVideoProps({ ...videoProps, statsLabel: e.target.value })}
                        placeholder="Ej: Conversión"
                        className="bg-zinc-950/70 border-zinc-800 text-zinc-100 text-xs focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300">Botón de Acción (CTA)</label>
                      <Input
                        value={videoProps.callToAction}
                        onChange={(e) => setVideoProps({ ...videoProps, callToAction: e.target.value })}
                        placeholder="Ej: Potencia tu Marca"
                        className="bg-zinc-950/70 border-zinc-800 text-zinc-100 text-xs focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Selector de Color de Acento */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Palette className="h-3.5 w-3.5 text-zinc-400" />
                        Color de Acento
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {videoProps.accentColor}
                      </span>
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => setVideoProps({ ...videoProps, accentColor: color.hex })}
                          className={`group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                            videoProps.accentColor.toLowerCase() === color.hex.toLowerCase()
                              ? "bg-zinc-800 border-white text-white shadow-sm ring-1 ring-white/50"
                              : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="text-[11px]">{color.name}</span>
                        </button>
                      ))}
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg">
                        <input
                          type="color"
                          value={videoProps.accentColor}
                          onChange={(e) =>
                            setVideoProps({ ...videoProps, accentColor: e.target.value })
                          }
                          className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                        />
                        <span className="text-[10px] font-mono text-zinc-400">Custom</span>
                      </div>
                    </div>
                  </div>

                  {/* Selector de Duración Remotion (15s, 30s o 1 minuto + personalizado) */}
                  <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-zinc-400" />
                        Duración del Video Remotion
                      </label>
                      <span className="text-[11px] font-mono text-indigo-400 font-semibold">
                        {durationSeconds === 60 ? "1 minuto (60s)" : `${durationSeconds} segundos`} • {durationSeconds * 30} frames
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {DURATION_PRESETS.map((item) => (
                        <button
                          key={item.seconds}
                          type="button"
                          onClick={() => handleChangeDuration(item.seconds)}
                          className={`py-2 px-2.5 rounded-xl border text-center transition-all relative ${
                            durationSeconds === item.seconds
                              ? "bg-indigo-600/20 border-indigo-500/80 text-white font-semibold shadow-sm ring-1 ring-indigo-500/40"
                              : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                          }`}
                        >
                          {item.badge && (
                            <span className="absolute -top-2 right-1.5 bg-indigo-500 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
                              {item.badge}
                            </span>
                          )}
                          <span className="text-xs sm:text-sm font-semibold block">{item.label}</span>
                          <p className="text-[10px] text-zinc-500 leading-tight mt-0.5 truncate">{item.desc}</p>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-xs text-zinc-400">
                      <span className="text-[11px] text-zinc-400">Personalizado:</span>
                      <input
                        type="number"
                        min={3}
                        max={120}
                        value={durationSeconds}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (!isNaN(val) && val >= 1 && val <= 120) {
                            handleChangeDuration(val);
                          }
                        }}
                        className="w-16 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-center text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-[11px] text-zinc-500">segundos (hasta 120s)</span>
                    </div>
                  </div>

                  {/* Destino de Guardado */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                      <span>Destino de Guardado</span>
                      <span className="text-[11px] text-zinc-400 font-normal">
                        {saveDestination === "device" ? "📱 Descarga Directa" : "☁️ Google Drive"}
                      </span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => setSaveDestination("device")}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                          saveDestination === "device"
                            ? "bg-indigo-600/20 border-indigo-500/80 text-white shadow-sm ring-1 ring-indigo-500/40"
                            : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        }`}
                      >
                        <Download
                          className={`h-4 w-4 mt-0.5 shrink-0 ${
                            saveDestination === "device" ? "text-indigo-400" : "text-zinc-500"
                          }`}
                        />
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-zinc-200">En mi dispositivo</p>
                          <p className="text-[10px] text-zinc-400 leading-tight">
                            Descarga directa (.mp4)
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => setSaveDestination("drive")}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                          saveDestination === "drive"
                            ? "bg-indigo-600/20 border-indigo-500/80 text-white shadow-sm ring-1 ring-indigo-500/40"
                            : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                        }`}
                      >
                        <HardDrive
                          className={`h-4 w-4 mt-0.5 shrink-0 ${
                            saveDestination === "drive" ? "text-emerald-400" : "text-zinc-500"
                          }`}
                        />
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-zinc-200">En Google Drive</p>
                          <p className="text-[10px] text-zinc-400 leading-tight">
                            Guardado en la nube y Biblioteca
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Botón Principal Remotion */}
                  <div className="pt-2">
                    <Button
                      onClick={handleRenderVideo}
                      disabled={isLoading}
                      className="w-full h-12 text-sm font-semibold rounded-xl transition-all shadow-lg gap-2.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/25 active:scale-[0.99]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          Generando Video MP4 en la Nube ({durationSeconds}s)...
                        </>
                      ) : (
                        <>
                          <Clapperboard className="h-4 w-4 text-white" />
                          Generar Video MP4 ({durationSeconds === 60 ? "1 min" : `${durationSeconds}s`})
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Columna Derecha: Smartphone Mockup con Previsualización (HTML Sandbox o Remotion Player) */}
        <div
          className={`lg:col-span-5 flex flex-col items-center justify-center space-y-3 ${
            mobileTab === "preview" ? "block" : "hidden lg:flex"
          }`}
        >
          {/* Top Bar del Visor */}
          <div className="w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[340px] flex items-center justify-between px-2 text-xs">
            <span className="font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 text-[11px]">
              <Smartphone className="h-3.5 w-3.5 text-zinc-400" />
              {mode === "html" ? "Previsualización HTML (9:16)" : "Previsualización Remotion (9:16)"}
            </span>
            <div className="flex items-center gap-1.5">
              {mode === "html" && (
                <button
                  type="button"
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                  title="Recargar vista previa"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              )}
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-zinc-800 text-zinc-400"
              >
                1080 × 1920
              </Badge>
            </div>
          </div>

          {/* Smartphone Mockup Container */}
          <div
            ref={phoneContainerRef}
            className="relative w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[340px] aspect-[9/16] rounded-[2.5rem] p-3 sm:p-3.5 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border-[4px] sm:border-[5px] border-zinc-800 shadow-2xl shadow-black ring-1 ring-zinc-700/50 flex flex-col"
          >
            {/* Dynamic Island / Notch */}
            <div className="absolute top-3.5 sm:top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <div className="w-20 sm:w-24 h-3.5 sm:h-4 bg-zinc-950 rounded-full border border-zinc-800/80 flex items-center justify-end px-2">
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-zinc-800" />
              </div>
            </div>

            {/* Pantalla del Smartphone */}
            <div className="relative flex-1 rounded-[1.8rem] overflow-hidden bg-zinc-950 border border-zinc-800/80 flex flex-col">
              {mode === "html" ? (
                /* Previsualizador de HTML interactivo mediante iframe escalado a 1080x1920 */
                <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
                  <div
                    style={{
                      width: 1080,
                      height: 1920,
                      transform: `scale(${previewScale})`,
                      transformOrigin: "center center",
                    }}
                    className="shrink-0 pointer-events-auto"
                  >
                    <iframe
                      key={iframeKey}
                      srcDoc={htmlCode || "<body style='background:#09090b;'></body>"}
                      title="Previsualización de Código HTML"
                      sandbox="allow-scripts"
                      className="w-[1080px] h-[1920px] border-0 bg-zinc-950"
                    />
                  </div>

                  {/* Badge flotante indicador HTML LIVE */}
                  <div className="absolute top-6 left-3.5 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md text-[10px] text-zinc-300 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>HTML LIVE • {durationSeconds === 60 ? "1 min" : `${durationSeconds}s`}</span>
                  </div>
                </div>
              ) : (
                /* Previsualizador de Remotion */
                <div className="relative w-full h-full">
                  <RemotionPreviewPlayer
                    props={videoProps}
                    durationInSeconds={durationSeconds}
                  />

                  {/* Badge flotante indicador REMOTION LIVE */}
                  <div className="absolute top-6 left-3.5 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md text-[10px] text-zinc-300 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    <span>REMOTION LIVE • {durationSeconds === 60 ? "1 min" : `${durationSeconds}s`}</span>
                  </div>
                </div>
              )}

              {/* Home bar inferior */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-1 bg-zinc-600/60 rounded-full pointer-events-none z-30" />
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 text-center max-w-[300px] leading-relaxed">
            {mode === "html"
              ? `Vista previa en vivo del código HTML en formato 9:16 vertical (${durationSeconds === 60 ? "1 min" : `${durationSeconds}s`}). Cualquier cambio se refleja al instante.`
              : `Previsualización Remotion con timeline y controles interactivos (${durationSeconds === 60 ? "1 min" : `${durationSeconds}s`}).`}
          </p>
        </div>
      </div>

      {/* Render Dialog Result Modal */}
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
                ? feedback?.isDirectDownload
                  ? "¡Video MP4 Generado y Descargado!"
                  : mode === "html"
                  ? "¡Conversión HTML a MP4 iniciada!"
                  : "¡Renderizado Remotion iniciado!"
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
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="text-zinc-400">Título:</span>
                <span className="font-semibold text-white">
                  {mode === "html" ? htmlTitle : videoProps.title}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span className="text-zinc-400">Motor:</span>
                <span className="font-semibold text-indigo-400">
                  {feedback?.engine || (mode === "html" ? "Convertidor HTML a MP4" : "Remotion Ultra HD")}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span className="text-zinc-400">Duración:</span>
                <span className="font-semibold text-white">
                  {durationSeconds === 60 ? "1 minuto (60s)" : `${durationSeconds} segundos`} (30fps)
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span className="text-zinc-400">Destino:</span>
                <span className="font-semibold text-emerald-400">
                  {feedback?.isDirectDownload
                    ? "📱 Descarga Directa en tu Dispositivo (Completada)"
                    : saveDestination === "device"
                    ? "📱 En este Dispositivo"
                    : "☁️ Google Drive (Biblioteca)"}
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Estado:</span>
                {feedback?.isDirectDownload ? (
                  <span className="text-xs text-emerald-400 inline-flex items-center gap-1 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Listo en tu carpeta de descargas
                  </span>
                ) : (
                  <a
                    href="https://github.com/jerepe244-coder/zyrvae-media-studio-desde-cero-es/actions/workflows/render-video.yml"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-medium hover:underline"
                  >
                    Ver en GitHub Actions
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
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
            {feedback?.type === "success" && (
              feedback?.isDirectDownload && feedback?.downloadUrl ? (
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
                  Volver a Descargar
                </Button>
              ) : (
                <a
                  href="https://github.com/jerepe244-coder/zyrvae-media-studio-desde-cero-es/actions/workflows/render-video.yml"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors gap-1.5"
                >
                  Seguir en GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              )
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
