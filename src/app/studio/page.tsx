"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  Sparkles,
  Play,
  Sliders,
  Smartphone,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Clapperboard,
  ArrowLeft,
  Ratio,
  Clock,
  Loader2,
  Palette,
  Type,
  ExternalLink
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const COLOR_PRESETS = [
  { label: "Indigo", value: "#6366f1" },
  { label: "Emerald", value: "#10b981" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Sky", value: "#0ea5e9" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Blanco", value: "#f4f4f5" },
]

export default function StudioPage() {
  const [videoTitle, setVideoTitle] = React.useState("Comercial ZYRVAE - Lanzamiento 2026")
  const [videoText, setVideoText] = React.useState("Potencia tu marca con video de alta conversión")
  const [videoColor, setVideoColor] = React.useState("#6366f1")
  const [template, setTemplate] = React.useState("Comercial ZYRVAE")
  const [aspectRatio, setAspectRatio] = React.useState("9:16")
  const [duration, setDuration] = React.useState("30s")
  const [isPlaying, setIsPlaying] = React.useState(false)

  // Render submission state
  const [isLoading, setIsLoading] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error"
    message: string
    details?: string
  } | null>(null)
  const [showResultModal, setShowResultModal] = React.useState(false)

  const handleRenderVideo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isLoading) return

    setIsLoading(true)
    setFeedback(null)

    try {
      const response = await fetch("/api/render", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: videoTitle.trim() || "Comercial ZYRVAE",
          text: videoText.trim() || "Potencia tu marca con video de alta conversión",
          color: videoColor || "#6366f1",
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || "Error al solicitar el renderizado.")
      }

      // Success
      setFeedback({
        type: "success",
        message: "Video en proceso. En unos minutos aparecerá en tu Biblioteca (Drive)",
      })
      setShowResultModal(true)
    } catch (err: unknown) {
      console.error("Error al renderizar:", err)
      const errorMsg = err instanceof Error ? err.message : String(err)
      setFeedback({
        type: "error",
        message: "No se pudo iniciar el renderizado.",
        details: errorMsg,
      })
      setShowResultModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
            <Link href="/library" className="hover:text-zinc-200 transition-colors flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              Biblioteca
            </Link>
            <span>/</span>
            <span className="text-zinc-200">Estudio</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
            Estudio de Creación
            <Badge variant="outline" className="text-xs font-normal border-zinc-700/60 text-emerald-400 bg-emerald-500/10">
              Motor HyperFrames Activo
            </Badge>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Configura los parámetros creativos, previsualiza el diseño y renderiza tu video a Google Drive mediante GitHub Actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/library">
            <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900">
              Ver Biblioteca
            </Button>
          </Link>
        </div>
      </div>

      {/* Persistent Success Banner if already rendered */}
      {feedback?.type === "success" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-900/60 text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-emerald-100">
                {feedback.message}
              </p>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                Pieza: &quot;{videoTitle}&quot; procesándose en GitHub Actions.
              </p>
            </div>
          </div>
          <Link href="/library">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-semibold gap-1.5 shrink-0">
              Ir a Biblioteca
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Configuration */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-7 space-y-6"
        >
          <Card className="border-zinc-800/80 bg-zinc-900/40 shadow-xl backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-zinc-800/60">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-zinc-100">
                    Configuración del Proyecto
                  </CardTitle>
                  <CardDescription className="text-zinc-400 mt-0.5">
                    Ajusta los detalles visuales de la pieza publicitaria.
                  </CardDescription>
                </div>
                <div className="p-2 rounded-lg bg-zinc-800/60 border border-zinc-700/40 text-zinc-300">
                  <Sliders className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Field 1: Nombre del video */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
                  <span>Nombre del video</span>
                  <span className="text-[11px] font-normal text-zinc-400 lowercase font-mono">
                    requerido
                  </span>
                </label>
                <Input
                  type="text"
                  placeholder="Ej: Comercial La Fresque"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  disabled={isLoading}
                  className="bg-zinc-950/70 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-400 focus-visible:ring-zinc-400/20"
                />
                <p className="text-[11px] text-zinc-400">
                  Este título identificará la pieza en la biblioteca y en Google Drive.
                </p>
              </div>

              {/* Field 2: Texto o Claim del video */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5 text-zinc-400" />
                    Texto o mensaje del video
                  </span>
                  <span className="text-[11px] font-normal text-zinc-400 lowercase font-mono">
                    input text
                  </span>
                </label>
                <Input
                  type="text"
                  placeholder="Ej: Potencia tu marca con video de alta conversión"
                  value={videoText}
                  onChange={(e) => setVideoText(e.target.value)}
                  disabled={isLoading}
                  className="bg-zinc-950/70 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-zinc-400 focus-visible:ring-zinc-400/20"
                />
                <p className="text-[11px] text-zinc-400">
                  Texto secundario animado que aparecerá bajo el título en el video.
                </p>
              </div>

              {/* Field 3: Color de acento de marca */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Palette className="h-3.5 w-3.5 text-zinc-400" />
                    Color de acento de marca
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {videoColor}
                  </span>
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      disabled={isLoading}
                      onClick={() => setVideoColor(preset.value)}
                      className={`h-8 px-3 rounded-lg border text-xs font-medium flex items-center gap-2 transition-all ${
                        videoColor.toLowerCase() === preset.value.toLowerCase()
                          ? "bg-zinc-800 border-zinc-400 text-zinc-100 ring-2 ring-zinc-500/30"
                          : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: preset.value }}
                      />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <input
                      type="color"
                      aria-label="Color personalizado"
                      value={videoColor.startsWith("#") ? videoColor : "#6366f1"}
                      onChange={(e) => setVideoColor(e.target.value)}
                      disabled={isLoading}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                  </div>
                </div>
              </div>

              {/* Field 4: Select Plantilla */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
                  <span>Plantilla</span>
                  <span className="text-[11px] font-normal text-zinc-400 font-mono">
                    3 disponibles
                  </span>
                </label>
                <Select value={template} onValueChange={setTemplate} disabled={isLoading}>
                  <SelectTrigger className="bg-zinc-950/70 border-zinc-800 text-zinc-100 focus:border-zinc-400 focus:ring-zinc-400/20">
                    <SelectValue placeholder="Selecciona una plantilla" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    <SelectItem value="Comercial ZYRVAE">
                      <div className="flex flex-col py-0.5">
                        <span className="font-medium text-zinc-100">Comercial ZYRVAE</span>
                        <span className="text-[11px] text-zinc-400">
                          Estilo cinematográfico con tipografía moderna y transiciones de marca.
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Caso de Éxito">
                      <div className="flex flex-col py-0.5">
                        <span className="font-medium text-zinc-100">Caso de Éxito</span>
                        <span className="text-[11px] text-zinc-400">
                          Estructura narrativa B2B con métricas destacadas y testimonios.
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Reel">
                      <div className="flex flex-col py-0.5">
                        <span className="font-medium text-zinc-100">Reel</span>
                        <span className="text-[11px] text-zinc-400">
                          Cortes dinámicos de alto impacto optimizados para Instagram y TikTok.
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Studio Controls (Visual Mock Linear style) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Ratio className="h-3.5 w-3.5 text-zinc-400" />
                    Formato
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setAspectRatio("9:16")}
                      className={`px-3 py-2 text-xs rounded-lg border text-center transition-all ${
                        aspectRatio === "9:16"
                          ? "bg-zinc-800 border-zinc-600 text-zinc-100 font-medium"
                          : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      9:16 (Vertical)
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => setAspectRatio("16:9")}
                      className={`px-3 py-2 text-xs rounded-lg border text-center transition-all ${
                        aspectRatio === "16:9"
                          ? "bg-zinc-800 border-zinc-600 text-zinc-100 font-medium"
                          : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      16:9 (Horizontal)
                    </button>
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-zinc-400" />
                    Duración
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {["15s", "30s", "60s"].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        disabled={isLoading}
                        onClick={() => setDuration(dur)}
                        className={`py-2 text-xs rounded-lg border text-center transition-all ${
                          duration === dur
                            ? "bg-zinc-800 border-zinc-600 text-zinc-100 font-medium"
                            : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Engine notice banner */}
              <div className="p-3.5 rounded-lg bg-zinc-950/60 border border-zinc-800/60 flex items-start gap-3">
                <Sparkles className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-200">
                    Fase 3: Renderizado en GitHub Actions + HyperFrames
                  </p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Al pulsar renderizar, se despacha un workflow en GitHub Actions que ejecuta el motor HyperFrames, genera el video MP4 y lo sube directamente a tu carpeta de Google Drive.
                  </p>
                </div>
              </div>

              {/* Render Button with loading state */}
              <div className="pt-2">
                <Button
                  onClick={handleRenderVideo}
                  disabled={isLoading}
                  className="w-full h-11 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold shadow-lg shadow-white/5 transition-all text-sm gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-zinc-950" />
                      Iniciando renderizado en GitHub Actions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-zinc-950 fill-zinc-950" />
                      Renderizar Video
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Smartphone Mockup (9:16 Vertical Preview) */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-5 flex flex-col items-center justify-center"
        >
          <div className="w-full flex items-center justify-between mb-3 px-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-zinc-400" />
              Simulador Móvil (9:16)
            </span>
            <Badge variant="outline" className="text-[10px] font-mono border-zinc-800 text-zinc-400">
              1080 × 1920
            </Badge>
          </div>

          {/* Smartphone Bezel Container */}
          <div className="relative w-full max-w-[320px] aspect-[9/16] rounded-[2.5rem] p-3 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border-[5px] border-zinc-800 shadow-2xl shadow-black ring-1 ring-zinc-700/50 flex flex-col">
            {/* Dynamic Island / Top Camera Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
              <div className="w-20 h-4 bg-zinc-950 rounded-full border border-zinc-800/80 flex items-center justify-end px-2">
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
              </div>
            </div>

            {/* Simulated Phone Screen */}
            <div className="relative flex-1 rounded-[1.8rem] overflow-hidden bg-zinc-950 border border-zinc-800/70 flex flex-col justify-between p-4 group select-none">
              {/* Background gradient lighting effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/60 via-zinc-950 to-zinc-950 pointer-events-none" />
              
              {/* Radial ambient glow reacting to selected color */}
              <div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-500"
                style={{
                  backgroundColor: videoColor,
                  opacity: 0.22,
                }}
              />

              {/* Grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

              {/* Screen Top Overlay: Video Metadata */}
              <div className="relative z-10 pt-6 flex items-center justify-between text-[11px] text-zinc-400">
                <span className="font-mono bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800/60 text-zinc-300">
                  {aspectRatio}
                </span>
                <span className="font-mono bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800/60 text-zinc-300">
                  {duration}
                </span>
              </div>

              {/* Screen Center: Live Preview Graphic & Play Button */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto px-3">
                {/* Big Play Icon with color border */}
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-20 h-20 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border-2 flex items-center justify-center backdrop-blur-md shadow-2xl transition-all duration-200 group-hover:scale-105 active:scale-95"
                  style={{ borderColor: videoColor }}
                  aria-label="Previsualización"
                >
                  <Play className={`h-8 w-8 ml-1 text-zinc-100 fill-zinc-100 ${isPlaying ? "opacity-90" : ""}`} />
                </button>

                {/* Accent line */}
                <div
                  className="w-10 h-1 rounded-full mt-4 transition-all duration-300"
                  style={{ backgroundColor: videoColor }}
                />

                {/* Big Title text */}
                <h3 className="mt-2 text-base font-bold text-zinc-100 tracking-tight max-w-[220px] line-clamp-2">
                  {videoTitle || "Sin título asignado"}
                </h3>

                {/* Subtitle / Dynamic text */}
                <p className="text-[11px] text-zinc-400 mt-1 max-w-[210px] line-clamp-2">
                  {videoText || "Texto o mensaje del comercial"}
                </p>

                <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] text-zinc-300">
                  <Clapperboard className="h-3 w-3 text-zinc-400" />
                  {template}
                </div>
              </div>

              {/* Screen Bottom Controls Overlay */}
              <div className="relative z-10 space-y-2">
                {/* Timeline progress bar using color */}
                <div className="w-full bg-zinc-800/80 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full w-2/5 rounded-full transition-all duration-300"
                    style={{ backgroundColor: videoColor }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>00:10 / 00:{duration.replace("s", "")}</span>
                  <div className="flex items-center gap-1 text-zinc-400">
                    <Volume2 className="h-3 w-3" />
                    <span>AUDIO OK</span>
                  </div>
                </div>
              </div>

              {/* Smartphone Home Indicator Bar */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-zinc-700/80 rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Render Dialog Result Modal */}
      <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <div
              className={`w-12 h-12 rounded-full border flex items-center justify-center mb-2 mx-auto sm:mx-0 ${
                feedback?.type === "success"
                  ? "bg-emerald-950/60 border-emerald-800/80 text-emerald-400"
                  : "bg-red-950/60 border-red-800/80 text-red-400"
              }`}
            >
              {feedback?.type === "success" ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )}
            </div>
            <DialogTitle className="text-lg text-zinc-100">
              {feedback?.type === "success"
                ? "¡Renderizado en marcha!"
                : "Error al iniciar renderizado"}
            </DialogTitle>
            <DialogDescription className="text-zinc-300 text-sm leading-relaxed pt-1">
              {feedback?.type === "success" ? (
                <span className="text-emerald-300 font-medium text-base block mt-1">
                  Video en proceso. En unos minutos aparecerá en tu Biblioteca (Drive)
                </span>
              ) : (
                feedback?.message
              )}
            </DialogDescription>
          </DialogHeader>

          {feedback?.type === "success" ? (
            <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-2 text-xs text-zinc-300">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Título:</span>
                <span className="text-zinc-200 font-semibold">{videoTitle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Motor:</span>
                <span className="text-zinc-200 font-mono">HyperFrames (GitHub Actions)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Destino:</span>
                <span className="text-emerald-400 font-medium">Google Drive (Biblioteca)</span>
              </div>
            </div>
          ) : (
            feedback?.details && (
              <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-xs text-red-300 font-mono max-h-36 overflow-y-auto">
                {feedback.details}
              </div>
            )
          )}

          <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
            {feedback?.type === "success" ? (
              <>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-zinc-800 text-zinc-300 hover:bg-zinc-900"
                  onClick={() => setShowResultModal(false)}
                >
                  Seguir en el Estudio
                </Button>
                <Link href="/library" className="w-full sm:w-auto">
                  <Button className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold gap-1.5">
                    Ir a la Biblioteca
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </>
            ) : (
              <Button
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                onClick={() => setShowResultModal(false)}
              >
                Cerrar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
