"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  UploadCloud,
  FileCode2,
  Play,
  RotateCcw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clapperboard,
  ArrowLeft,
  Loader2,
  Trash2,
  Copy,
  Clock,
  Printer,
  Smartphone,
  Eye,
  Check
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Plantilla de demostración para el botón "Cargar Ejemplo"
const SAMPLE_AD_HTML = `<!DOCTYPE html>
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
    .progress-fill { height: 100%; width: 0%; background: linear-gradient(90deg, #6366f1, #ec4899); box-shadow: 0 0 20px #6366f1; animation: fillProgress 10s linear infinite; }
    @keyframes fillProgress { 0% { width: 0%; } 100% { width: 100%; } }
    .foot-labels { display: flex; justify-content: space-between; font-size: 24px; color: #71717a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; }
    @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
  </style>
</head>
<body data-composition-id="main" data-duration="10" data-width="1080" data-height="1920" data-fps="30" data-no-timeline>
  <div class="canvas">
    <div class="orb"></div>
    <div class="badge">
      <span class="badge-dot"></span>
      <span class="badge-text">ZYRVAE MEDIA STUDIO</span>
    </div>
    <div class="hero">
      <span class="tag">Convertidor HTML a Video</span>
      <h1 class="title">Tu publicidad en código, <span>convertida a MP4</span> al instante.</h1>
      <p class="desc">Imprenta automatizada con motor HyperFrames en resolución Ultra HD 9:16 vertical.</p>
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
        <span>Renderizado HyperFrames</span>
        <span>Google Drive Cloud</span>
      </div>
    </div>
  </div>
</body>
</html>`

export default function StudioPage() {
  // Input method: "file" or "paste"
  const [inputTab, setInputTab] = React.useState<"file" | "paste">("file")
  const [htmlCode, setHtmlCode] = React.useState<string>("")
  const [uploadedFileName, setUploadedFileName] = React.useState<string>("")
  const [uploadedFileSize, setUploadedFileSize] = React.useState<string>("")
  const [isDragging, setIsDragging] = React.useState(false)

  // Video settings
  const [videoTitle, setVideoTitle] = React.useState<string>("Comercial ZYRVAE")
  const [duration, setDuration] = React.useState<string>("10s")

  // Preview state
  const [iframeKey, setIframeKey] = React.useState(0)
  const phoneScreenRef = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(0.28)
  const [isCopied, setIsCopied] = React.useState(false)

  // Render & API dispatch state
  const [isLoading, setIsLoading] = React.useState(false)
  const [feedback, setFeedback] = React.useState<{
    type: "success" | "error"
    message: string
    details?: string
  } | null>(null)
  const [showResultModal, setShowResultModal] = React.useState(false)

  // Measure phone screen container to dynamically scale the 1080x1920 iframe
  React.useEffect(() => {
    const updateScale = () => {
      if (phoneScreenRef.current) {
        const width = phoneScreenRef.current.clientWidth
        if (width > 0) {
          setScale(width / 1080)
        }
      }
    }

    updateScale()
    window.addEventListener("resize", updateScale)
    const timer = setTimeout(updateScale, 150)

    return () => {
      window.removeEventListener("resize", updateScale)
      clearTimeout(timer)
    }
  }, [htmlCode])

  // Extract title and duration from HTML if available
  const inspectHtml = (code: string, fallbackName?: string) => {
    if (!code) return

    // Extract <title>
    const titleMatch = code.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (titleMatch && titleMatch[1]) {
      setVideoTitle(titleMatch[1].trim())
    } else if (fallbackName) {
      const clean = fallbackName.replace(/\.(html|htm)$/i, "").trim()
      if (clean) setVideoTitle(clean)
    }

    // Extract data-duration
    const durationMatch = code.match(/data-duration=["'](\d+)["']/i)
    if (durationMatch && durationMatch[1]) {
      setDuration(`${durationMatch[1]}s`)
    }
  }

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = (e.target?.result as string) || ""
      setHtmlCode(content)
      setUploadedFileName(file.name)
      setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`)
      inspectHtml(content, file.name)
      setIframeKey((prev) => prev + 1)
    }
    reader.readAsText(file)
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  // Handle direct file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  // Handle paste from clipboard
  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text && text.trim()) {
        setHtmlCode(text.trim())
        setUploadedFileName("codigo_pegado.html")
        setUploadedFileSize(`${(new Blob([text]).size / 1024).toFixed(1)} KB`)
        inspectHtml(text.trim())
        setIframeKey((prev) => prev + 1)
      }
    } catch (err) {
      console.warn("No se pudo leer el portapapeles:", err)
    }
  }

  // Load sample demo ad
  const handleLoadSample = () => {
    setHtmlCode(SAMPLE_AD_HTML)
    setUploadedFileName("comercial_ejemplo_zyrvae.html")
    setUploadedFileSize("3.4 KB")
    inspectHtml(SAMPLE_AD_HTML)
    setIframeKey((prev) => prev + 1)
  }

  // Clear loaded HTML
  const handleClear = () => {
    setHtmlCode("")
    setUploadedFileName("")
    setUploadedFileSize("")
    setVideoTitle("Comercial ZYRVAE")
  }

  // Restart preview animation
  const handleRestartPreview = () => {
    setIframeKey((prev) => prev + 1)
  }

  // Open preview in new browser tab
  const handleOpenInNewTab = () => {
    if (!htmlCode) return
    const blob = new Blob([htmlCode], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    window.open(url, "_blank")
  }

  // Copy HTML code
  const handleCopyCode = async () => {
    if (!htmlCode) return
    try {
      await navigator.clipboard.writeText(htmlCode)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  // Handle Render to MP4
  const handleRenderVideo = async () => {
    if (!htmlCode.trim() || isLoading) return

    setIsLoading(true)
    setFeedback(null)

    try {
      const durationSeconds = duration.replace(/[^0-9]/g, "") || "10"

      const response = await fetch("/api/render", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: videoTitle.trim() || "Comercial ZYRVAE",
          html: htmlCode,
          duration: durationSeconds,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || "Error al solicitar la conversión a MP4.")
      }

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
        message: "No se pudo iniciar la conversión a video.",
        details: errorMsg,
      })
      setShowResultModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  const htmlSizeKb = React.useMemo(() => {
    if (!htmlCode) return 0
    return Buffer.byteLength(htmlCode, "utf-8") / 1024
  }, [htmlCode])

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
            <Printer className="h-7 w-7 text-indigo-400" />
            Convertidor HTML a Video
            <Badge variant="outline" className="text-xs font-normal border-zinc-700/60 text-indigo-400 bg-indigo-500/10">
              Imprenta ZYRVAE
            </Badge>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Trae el diseño publicitario generado por IA (HTML + CSS + Animaciones) y conviértelo directamente a un video MP4 vertical (9:16) en Google Drive.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadSample}
            className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            Cargar Ejemplo
          </Button>
          <Link href="/library">
            <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900">
              Ver Biblioteca
            </Button>
          </Link>
        </div>
      </div>

      {/* Persistent Success Banner if already dispatched */}
      {feedback?.type === "success" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-900/60 text-emerald-400 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-emerald-100">
                {feedback.message}
              </p>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                Pieza: &quot;{videoTitle}&quot; procesándose en GitHub Actions con HyperFrames.
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

      {/* Main Two-Column Layout: Importer (Left) vs 9:16 Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: El Importador (Imprenta) */}
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
                  <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
                    <FileCode2 className="h-5 w-5 text-indigo-400" />
                    1. Importador de Anuncio HTML
                  </CardTitle>
                  <CardDescription className="text-zinc-400 mt-0.5">
                    Alimenta la imprenta con tu archivo o código. No necesitas tocar ni programar nada.
                  </CardDescription>
                </div>

                {/* Tabs to toggle between Upload File vs Paste Code */}
                <div className="flex items-center bg-zinc-950/80 p-1 rounded-lg border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setInputTab("file")}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      inputTab === "file"
                        ? "bg-zinc-800 text-zinc-100 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Subir Archivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputTab("paste")}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                      inputTab === "paste"
                        ? "bg-zinc-800 text-zinc-100 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Pegar Código
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* TAB 1: SUBIR ARCHIVO */}
              {inputTab === "file" && (
                <div className="space-y-4">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                      isDragging
                        ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
                        : htmlCode
                        ? "border-emerald-500/50 bg-emerald-950/10 hover:border-emerald-500/70"
                        : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-950/60"
                    }`}
                  >
                    <input
                      type="file"
                      accept=".html,.htm"
                      onChange={handleFileInputChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Subir archivo .html"
                    />

                    {htmlCode ? (
                      <div className="space-y-3 pointer-events-none">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-900/40 border border-emerald-700/60 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-950">
                          <CheckCircle2 className="h-7 w-7" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-emerald-200">
                            {uploadedFileName || "archivo.html"}
                          </p>
                          <p className="text-xs text-zinc-400 mt-1">
                            {uploadedFileSize} • Listo para previsualizar y convertir
                          </p>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          Arrastra otro archivo o haz clic para reemplazarlo.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 pointer-events-none">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mx-auto text-zinc-300 shadow-inner">
                          <UploadCloud className="h-7 w-7 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-200">
                            Arrastra tu archivo <span className="text-indigo-400 font-mono">.html</span> aquí
                          </p>
                          <p className="text-xs text-zinc-400 mt-1">
                            o haz clic para explorar en tu computadora
                          </p>
                        </div>
                        <Badge variant="outline" className="text-[10px] text-zinc-400 border-zinc-800">
                          Soporta HTML5, CSS animado, SVG, GSAP y Tailwind
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: PEGAR CÓDIGO */}
              {inputTab === "paste" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-300">
                      Código HTML de la Publicidad
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePasteFromClipboard}
                        className="hover:text-zinc-100 flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/50 transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                        Pegar Portapapeles
                      </button>
                      {htmlCode && (
                        <button
                          type="button"
                          onClick={handleClear}
                          className="hover:text-rose-400 flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/50 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                          Limpiar
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      value={htmlCode}
                      onChange={(e) => {
                        const val = e.target.value
                        setHtmlCode(val)
                        inspectHtml(val)
                        setUploadedFileName("codigo_pegado.html")
                        setUploadedFileSize(`${(new Blob([val]).size / 1024).toFixed(1)} KB`)
                      }}
                      placeholder={`<!DOCTYPE html>\n<html lang="es">\n<head>\n  <title>Mi Comercial</title>\n  <style>...</style>\n</head>\n<body>\n  ...\n</body>\n</html>`}
                      rows={9}
                      className="w-full rounded-xl bg-zinc-950/80 border border-zinc-800 p-3.5 text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 leading-relaxed resize-y"
                    />

                    {htmlCode && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-none">
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800">
                          {htmlSizeKb.toFixed(1)} KB • {htmlCode.length} carácteres
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Warnings or File Status */}
              {htmlCode && (
                <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-zinc-950/60 border border-zinc-800/70">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span className="text-zinc-300 font-medium truncate max-w-[250px]">
                      {uploadedFileName || "archivo.html"}
                    </span>
                    <span className="text-zinc-400 font-mono text-[11px]">
                      ({htmlSizeKb.toFixed(1)} KB)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="text-zinc-400 hover:text-zinc-200 text-[11px] flex items-center gap-1 transition-colors"
                    >
                      {isCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      {isCopied ? "Copiado" : "Copiar"}
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-zinc-400 hover:text-rose-400 text-[11px] flex items-center gap-1 transition-colors ml-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Quitar
                    </button>
                  </div>
                </div>
              )}

              {/* Video Output Metadata */}
              <div className="pt-2 border-t border-zinc-800/60 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
                    <span>Nombre del archivo / video</span>
                    <span className="text-[11px] font-normal text-zinc-400">
                      Se guardará con este nombre en Google Drive
                    </span>
                  </label>
                  <Input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="Ej: Comercial ZYRVAE"
                    disabled={isLoading}
                    className="bg-zinc-950/70 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus-visible:border-indigo-400 focus-visible:ring-indigo-400/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-zinc-400" />
                    Duración del renderizado
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["5s", "10s", "15s", "30s"].map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        disabled={isLoading}
                        onClick={() => setDuration(dur)}
                        className={`py-2 text-xs rounded-lg border text-center transition-all ${
                          duration === dur
                            ? "bg-indigo-600/20 border-indigo-500/80 text-indigo-200 font-semibold shadow-sm"
                            : "bg-zinc-950/50 border-zinc-800/80 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Printing press automated explanation */}
              <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-start gap-3">
                <Printer className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-zinc-200">
                    Imprenta Automatizada con HyperFrames
                  </p>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Al pulsar convertir, enviamos el HTML exacto a la fábrica de GitHub Actions. HyperFrames renderiza cada fotograma en resolución vertical 1080×1920 y sube el archivo .mp4 listo para publicar a Google Drive.
                  </p>
                </div>
              </div>

              {/* The Big Convert to MP4 Button */}
              <div className="pt-2">
                <Button
                  onClick={handleRenderVideo}
                  disabled={!htmlCode.trim() || isLoading}
                  className={`w-full h-12 text-sm font-semibold rounded-xl transition-all shadow-lg gap-2.5 ${
                    !htmlCode.trim()
                      ? "bg-zinc-800 text-zinc-400 cursor-not-allowed opacity-60"
                      : "bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/25 active:scale-[0.99]"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Enviando a la fábrica de GitHub Actions...
                    </>
                  ) : (
                    <>
                      <Clapperboard className="h-4 w-4 text-white" />
                      Convertir a MP4
                    </>
                  )}
                </Button>
                {!htmlCode.trim() && (
                  <p className="text-[11px] text-zinc-400 text-center mt-2">
                    Sube un archivo o pega el código HTML arriba para habilitar la conversión.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Previsualización en Visor Vertical 9:16 */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-5 flex flex-col items-center justify-center space-y-3"
        >
          {/* Top Preview Controls Bar */}
          <div className="w-full max-w-[340px] flex items-center justify-between px-2 text-xs">
            <span className="font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-zinc-400" />
              Visor Vertical (9:16)
            </span>
            <div className="flex items-center gap-2">
              {htmlCode && (
                <>
                  <button
                    type="button"
                    onClick={handleRestartPreview}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Reiniciar animación"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenInNewTab}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title="Abrir en pestaña nueva"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
              <Badge variant="outline" className="text-[10px] font-mono border-zinc-800 text-zinc-400">
                1080 × 1920
              </Badge>
            </div>
          </div>

          {/* Smartphone Mockup Container (9:16 ratio) */}
          <div className="relative w-full max-w-[340px] aspect-[9/16] rounded-[2.8rem] p-3.5 bg-gradient-to-b from-zinc-800 via-zinc-900 to-zinc-950 border-[5px] border-zinc-800 shadow-2xl shadow-black ring-1 ring-zinc-700/50 flex flex-col">
            {/* Dynamic Island / Top Camera Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
              <div className="w-24 h-4 bg-zinc-950 rounded-full border border-zinc-800/80 flex items-center justify-end px-2">
                <div className="w-2 h-2 rounded-full bg-zinc-800" />
              </div>
            </div>

            {/* Simulated Phone Screen Viewport */}
            <div
              ref={phoneScreenRef}
              className="relative flex-1 rounded-[2rem] overflow-hidden bg-zinc-950 border border-zinc-800/80 flex flex-col select-none"
            >
              {htmlCode ? (
                <>
                  {/* Real Live Sandboxed IFrame scaled to 1080x1920 native aspect */}
                  <iframe
                    key={iframeKey}
                    title="Previsualización Publicidad HTML"
                    srcDoc={htmlCode}
                    sandbox="allow-scripts allow-same-origin"
                    style={{
                      width: "1080px",
                      height: "1920px",
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                      border: "none",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      pointerEvents: "auto",
                      backgroundColor: "#09090b",
                    }}
                  />

                  {/* Subtle live indicator badge in bottom overlay */}
                  <div className="absolute bottom-4 left-4 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md text-[10px] text-zinc-300 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>PREVIEW 9:16</span>
                  </div>
                </>
              ) : (
                /* Empty state when no HTML is loaded */
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-gradient-to-b from-zinc-900/40 via-zinc-950 to-zinc-950">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-xl shadow-black/40">
                    <Clapperboard className="h-8 w-8 text-zinc-400" />
                  </div>

                  <div className="space-y-1.5 max-w-[220px]">
                    <h3 className="text-sm font-semibold text-zinc-200">
                      Esperando diseño HTML
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Sube un archivo .html o pega tu código publicitario para ver la animación aquí en tiempo real.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadSample}
                    className="border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 text-xs gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    Probar con Ejemplo
                  </Button>
                </div>
              )}

              {/* Smartphone Home Indicator Bar at the bottom */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-zinc-600/80 rounded-full pointer-events-none z-30" />
            </div>
          </div>

          <p className="text-[11px] text-zinc-400 text-center max-w-[320px]">
            Renderizado nativo idéntico al navegador. Los estilos, tipografías y animaciones se verán tal cual en el video MP4 final.
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
                ? "¡Conversión a MP4 iniciada!"
                : "Error al iniciar la conversión"}
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
                <span className="text-zinc-400">Duración:</span>
                <span className="text-zinc-200 font-mono">{duration}</span>
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
