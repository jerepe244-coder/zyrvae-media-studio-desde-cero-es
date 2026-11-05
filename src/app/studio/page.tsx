"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
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
  MousePointerClick,
  Layers,
  Clock,
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

// Importación dinámica del reproductor Remotion para evitar problemas de SSR en Next.js
const RemotionPreviewPlayer = dynamic(
  () => import("@/components/studio/RemotionPreviewPlayer"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        <p className="text-xs text-zinc-400">Cargando reproductor Remotion...</p>
      </div>
    ),
  }
);

const COLOR_PRESETS = [
  { name: "Índigo ZYRVAE", hex: "#6366f1" },
  { name: "Esmeralda", hex: "#10b981" },
  { name: "Rosa Neón", hex: "#f43f5e" },
  { name: "Violeta Profundo", hex: "#8b5cf6" },
  { name: "Ámbar Dorado", hex: "#f59e0b" },
  { name: "Cian Eléctrico", hex: "#06b6d4" },
];

export default function StudioPage() {
  // Estado de las propiedades del video Remotion
  const [videoProps, setVideoProps] = React.useState<CommercialProps>({
    ...defaultCommercialProps,
  });

  // Configuración general
  const [durationSeconds, setDurationSeconds] = React.useState<number>(10);
  const [saveDestination, setSaveDestination] = React.useState<"device" | "drive">("device");

  // Estado del modal y envío a renderizar
  const [isLoading, setIsLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error";
    message: string;
    details?: string;
  } | null>(null);
  const [showResultModal, setShowResultModal] = React.useState(false);

  // Cargar plantilla: Comercial ZYRVAE
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
    setDurationSeconds(10);
  };

  // Cargar plantilla: Flash Sale / Oferta
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
    setDurationSeconds(5);
  };

  // Cargar plantilla: Caso de Éxito
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
    setDurationSeconds(15);
  };

  // Enviar orden de renderizado a GitHub Actions
  const handleRenderVideo = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/render", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: videoProps.title.trim() || "Comercial ZYRVAE",
          duration: `${durationSeconds}`,
          accentColor: videoProps.accentColor,
          props: videoProps,
          destination: saveDestination,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Error al solicitar la conversión a MP4.");
      }

      const successMsg =
        saveDestination === "device"
          ? "¡Renderizado con Remotion iniciado! En breves instantes podrás descargar tu video MP4 en tu dispositivo."
          : "¡Renderizado con Remotion iniciado! El video se generará y se guardará en tu Google Drive.";

      setFeedback({
        type: "success",
        message: successMsg,
      });
      setShowResultModal(true);
    } catch (err: unknown) {
      console.error("Error al renderizar:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setFeedback({
        type: "error",
        message: "No se pudo iniciar el renderizado.",
        details: errorMsg,
      });
      setShowResultModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800/80">
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
            <span className="text-zinc-200 font-medium">Estudio Remotion</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Clapperboard className="h-7 w-7 text-indigo-400" />
            Estudio de Video Comercial
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Crea anuncios publicitarios 9:16 Ultra HD con el motor de video en código Remotion.
          </p>
        </div>

        {/* Acceso rápido a plantillas */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadTemplateZyrvae}
            className="border-zinc-800 hover:bg-zinc-800 text-xs gap-1.5 text-zinc-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Comercial ZYRVAE
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadTemplateSale}
            className="border-zinc-800 hover:bg-zinc-800 text-xs gap-1.5 text-zinc-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-rose-400" />
            Oferta Flash
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadTemplateSuccess}
            className="border-zinc-800 hover:bg-zinc-800 text-xs gap-1.5 text-zinc-300"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Caso de Éxito
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editor de Propiedades del Video (7 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-7 space-y-6"
        >
          {/* Card: Textos y Mensaje Principal */}
          <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <Type className="h-4 w-4 text-indigo-400" />
                Textos y Mensaje Comercial
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Los textos se actualizan en vivo en el reproductor de la derecha.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Título Principal */}
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

              {/* Subtítulo y Nombre de Marca en 2 columnas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="text-xs font-medium text-zinc-300">Nombre de Marca (Badge Superior)</label>
                  <Input
                    value={videoProps.brandName}
                    onChange={(e) => setVideoProps({ ...videoProps, brandName: e.target.value })}
                    placeholder="Ej: ZYRVAE MEDIA STUDIO"
                    className="bg-zinc-950/70 border-zinc-800 text-zinc-100 text-xs focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Descripción */}
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

          {/* Card: Métricas, CTA y Color */}
          <Card className="border-zinc-800/80 bg-zinc-900/40 backdrop-blur-md shadow-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Métricas, Llamado a la Acción y Estilo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Tarjeta de Métricas y CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    placeholder="Ej: Retención Visual"
                    className="bg-zinc-950/70 border-zinc-800 text-zinc-100 text-xs focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Botón de Acción (CTA)</label>
                  <Input
                    value={videoProps.callToAction}
                    onChange={(e) => setVideoProps({ ...videoProps, callToAction: e.target.value })}
                    placeholder="Ej: Comprar Ahora"
                    className="bg-zinc-950/70 border-zinc-800 text-zinc-100 text-xs focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Selector de Color de Acento */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5 text-zinc-400" />
                    Color de Acento de Marca
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {videoProps.accentColor}
                  </span>
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setVideoProps({ ...videoProps, accentColor: color.hex })}
                      className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                        videoProps.accentColor.toLowerCase() === color.hex.toLowerCase()
                          ? "bg-zinc-800 border-white text-white shadow-sm ring-1 ring-white/50"
                          : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                    </button>
                  ))}
                  {/* Selector Custom */}
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

              {/* Selector de Duración */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-zinc-400" />
                  Duración del Video
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[5, 10, 15].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setDurationSeconds(sec)}
                      className={`py-2 px-3 rounded-xl border text-center transition-all ${
                        durationSeconds === sec
                          ? "bg-indigo-600/20 border-indigo-500/80 text-white font-semibold shadow-sm ring-1 ring-indigo-500/40"
                          : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                      }`}
                    >
                      <span className="text-sm font-semibold">{sec} segundos</span>
                      <p className="text-[10px] text-zinc-500">{sec * 30} fotogramas</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Destino de Guardado */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span>Destino de Guardado</span>
                  <span className="text-[10px] text-zinc-400 font-normal">
                    {saveDestination === "device" ? "📱 Descarga Directa" : "☁️ Google Drive"}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
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

              {/* Botón Principal de Renderizado */}
              <div className="pt-3">
                <Button
                  onClick={handleRenderVideo}
                  disabled={isLoading}
                  className="w-full h-12 text-sm font-semibold rounded-xl transition-all shadow-lg gap-2.5 bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/25 active:scale-[0.99]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Iniciando renderizado con Remotion...
                    </>
                  ) : saveDestination === "device" ? (
                    <>
                      <Download className="h-4 w-4 text-white" />
                      Renderizar con Remotion y Descargar a mi Dispositivo
                    </>
                  ) : (
                    <>
                      <HardDrive className="h-4 w-4 text-white" />
                      Renderizar con Remotion y Guardar en Google Drive
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-zinc-500 text-center mt-2.5">
                  El motor Remotion renderiza con precisión matemática fotograma por fotograma en 1080×1920.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Reproductor Remotion en Vivo (5 cols) */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-5 flex flex-col items-center justify-center space-y-3"
        >
          {/* Top Bar del Visor */}
          <div className="w-full max-w-[340px] flex items-center justify-between px-2 text-xs">
            <span className="font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-zinc-400" />
              Previsualización Remotion (9:16)
            </span>
            <Badge
              variant="outline"
              className="text-[10px] font-mono border-zinc-800 text-zinc-400"
            >
              1080 × 1920
            </Badge>
          </div>

          {/* Smartphone Mockup Container con el Remotion Player */}
          <div className="relative w-full max-w-[340px] aspect-[9/16] rounded-[2.8rem] p-3.5 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border-[5px] border-zinc-800 shadow-2xl shadow-black ring-1 ring-zinc-700/50 flex flex-col">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
              <div className="w-24 h-4 bg-zinc-950 rounded-full border border-zinc-800/80 flex items-center justify-end px-2">
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
              </div>
            </div>

            {/* Pantalla del Celular con el Reproductor Remotion */}
            <div className="relative flex-1 rounded-[2rem] overflow-hidden bg-zinc-950 border border-zinc-800/80 flex flex-col select-none">
              <RemotionPreviewPlayer
                props={videoProps}
                durationInSeconds={durationSeconds}
              />

              {/* Indicador de Remotion en vivo */}
              <div className="absolute top-8 left-4 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md text-[10px] text-zinc-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>REMOTION LIVE</span>
              </div>

              {/* Home bar inferior */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-zinc-600/60 rounded-full pointer-events-none z-30" />
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 text-center max-w-[320px] leading-relaxed">
            Previsualización interactiva Remotion en tiempo real. Usa los controles para reproducir, pausar o deslizarte por la línea de tiempo.
          </p>
        </motion.div>
      </div>

      {/* Render Dialog Result Modal */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100">
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
            <DialogTitle className="text-lg font-semibold">
              {feedback?.type === "success"
                ? "¡Conversión iniciada con Remotion!"
                : "Error al iniciar la conversión"}
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
                <span className="font-semibold text-white">{videoProps.title}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span className="text-zinc-400">Duración:</span>
                <span className="font-semibold text-white">{durationSeconds}s (Remotion 30fps)</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span className="text-zinc-400">Destino:</span>
                <span className="font-semibold text-indigo-400">
                  {saveDestination === "device"
                    ? "📱 En este Dispositivo"
                    : "☁️ Google Drive (Biblioteca)"}
                </span>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400">Progreso en vivo:</span>
                <a
                  href="https://github.com/jerepe244-coder/zyrvae-media-studio-desde-cero-es/actions/workflows/render-video.yml"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-medium hover:underline"
                >
                  Ver ejecución en GitHub Actions
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowResultModal(false)}
              className="border-zinc-800 hover:bg-zinc-900 text-xs text-zinc-300"
            >
              Cerrar
            </Button>
            {feedback?.type === "success" && (
              <a
                href="https://github.com/jerepe244-coder/zyrvae-media-studio-desde-cero-es/actions/workflows/render-video.yml"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors gap-1.5"
              >
                Seguir Render en GitHub
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
