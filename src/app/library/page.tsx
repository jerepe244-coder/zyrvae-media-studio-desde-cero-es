"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Play,
  Clock,
  HardDrive,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Download,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type VideoStatus = "En Drive" | "Renderizando" | "Borrador"

interface DriveVideo {
  id: string
  title: string
  driveLink: string
  downloadLink?: string
  thumbnail?: string | null
  date: string
}

interface DriveApiResponse {
  configured?: boolean
  folderConfigured?: boolean
  folderId?: string | null
  videos?: DriveVideo[]
  error?: string
  details?: string
  message?: string
}

const GRADIENT_PALETTES = [
  "from-emerald-500/20 via-zinc-900 to-zinc-950",
  "from-purple-500/20 via-zinc-900 to-zinc-950",
  "from-blue-500/20 via-zinc-900 to-zinc-950",
  "from-cyan-500/20 via-zinc-900 to-zinc-950",
  "from-amber-500/20 via-zinc-900 to-zinc-950",
  "from-rose-500/20 via-zinc-900 to-zinc-950",
]

export default function LibraryPage() {
  const [videos, setVideos] = React.useState<DriveVideo[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [driveConfig, setDriveConfig] = React.useState<DriveApiResponse | null>(null)
  const [filter, setFilter] = React.useState<"all" | VideoStatus>("all")
  const [search, setSearch] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [newVideoTitle, setNewVideoTitle] = React.useState("")
  const [newVideoTemplate, setNewVideoTemplate] = React.useState("Comercial ZYRVAE")

  React.useEffect(() => {
    let ignore = false
    const fetchVideos = async () => {
      try {
        const res = await fetch("/api/videos")
        const data: DriveApiResponse | DriveVideo[] = await res.json()
        if (!ignore) {
          if (Array.isArray(data)) {
            setVideos(data)
            setDriveConfig({ configured: true, videos: data })
          } else {
            setDriveConfig(data)
            setVideos(data.videos || [])
          }
        }
      } catch (err) {
        console.error("Error al cargar videos:", err)
        if (!ignore) setVideos([])
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchVideos()
    return () => {
      ignore = true
    }
  }, [])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    try {
      const res = await fetch("/api/videos")
      const data: DriveApiResponse | DriveVideo[] = await res.json()
      if (Array.isArray(data)) {
        setVideos(data)
        setDriveConfig({ configured: true, videos: data })
      } else {
        setDriveConfig(data)
        setVideos(data.videos || [])
      }
    } catch (err) {
      console.error("Error al cargar videos:", err)
      setVideos([])
    } finally {
      setIsRefreshing(false)
    }
  }

  const filteredVideos = React.useMemo(() => {
    return videos.filter((video) => {
      const matchesFilter = filter === "all" || filter === "En Drive"
      const matchesSearch =
        video.title.toLowerCase().includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [videos, filter, search])

  const renderBadge = (status: VideoStatus = "En Drive") => {
    switch (status) {
      case "En Drive":
        return (
          <Badge variant="success" className="gap-1.5 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            En Drive
          </Badge>
        )
      case "Renderizando":
        return (
          <Badge variant="warning" className="gap-1.5 font-medium">
            <RefreshCw className="h-2.5 w-2.5 animate-spin text-amber-400" />
            Renderizando
          </Badge>
        )
      case "Borrador":
        return (
          <Badge variant="neutral" className="gap-1.5 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
            Borrador
          </Badge>
        )
    }
  }

  return (
    <div className="px-4 py-5 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">
              Biblioteca
            </h1>
            <Badge variant="secondary" className="text-[11px] font-mono text-zinc-400">
              {videos.length} {videos.length === 1 ? "video" : "videos"}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Administra tus comerciales, visualiza estados de renderizado y accede a copias en Drive.
          </p>
        </div>

        {/* Action Buttons: Refresh + Nuevo Video */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="default"
            onClick={() => handleManualRefresh()}
            disabled={loading || isRefreshing}
            className="w-full sm:w-auto border-zinc-800 text-zinc-300 hover:bg-zinc-900 gap-2 text-xs h-10 sm:h-9"
            title="Sincronizar con Google Drive"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
            Sincronizar
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full sm:w-auto shadow-lg shadow-white/5 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-medium gap-2 text-xs h-10 sm:h-9"
                size="default"
              >
                <Plus className="h-4 w-4" />
                + Nuevo Video
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-zinc-100">
                  <Sparkles className="h-5 w-5 text-zinc-300" />
                  Crear Nuevo Video
                </DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Inicia un nuevo proyecto comercial para configurar en el Estudio.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Nombre del video
                  </label>
                  <Input
                    placeholder="Ej: Comercial La Fresque 2026"
                    value={newVideoTitle}
                    onChange={(e) => setNewVideoTitle(e.target.value)}
                    className="bg-zinc-900/80 border-zinc-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Plantilla inicial
                  </label>
                  <Select
                    value={newVideoTemplate}
                    onValueChange={setNewVideoTemplate}
                  >
                    <SelectTrigger className="bg-zinc-900/80 border-zinc-800">
                      <SelectValue placeholder="Selecciona plantilla" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Comercial ZYRVAE">Comercial ZYRVAE</SelectItem>
                      <SelectItem value="Caso de Éxito">Caso de Éxito</SelectItem>
                      <SelectItem value="Lanzamiento Producto">Lanzamiento Producto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="border-zinc-800 hover:bg-zinc-900 text-zinc-300"
                >
                  Cancelar
                </Button>
                <Link
                  href={`/studio?title=${encodeURIComponent(newVideoTitle || newVideoTemplate)}`}
                  className="inline-flex"
                >
                  <Button
                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-semibold gap-1.5"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Abrir en Estudio
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Diagnostic banner if Google Drive is not configured */}
      {driveConfig?.configured === false && (
        <div className="p-4 rounded-xl border border-amber-900/60 bg-amber-950/20 text-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-100">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Configuración de Google Drive pendiente en el servidor
          </div>
          <p className="text-amber-300/90 leading-relaxed">
            Para que los videos renderizados aparezcan en tu Biblioteca y se sincronicen con Google Drive, asegúrate de configurar las credenciales en Vercel y en GitHub Actions.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-3 font-mono text-[11px] text-amber-400">
            <span>• GOOGLE_CLIENT_EMAIL</span>
            <span>• GOOGLE_PRIVATE_KEY</span>
            <span>• GOOGLE_DRIVE_FOLDER_ID</span>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800/80 w-fit">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === "all"
                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Todos ({videos.length})
          </button>
          <button
            onClick={() => setFilter("En Drive")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === "En Drive"
                ? "bg-zinc-800 text-zinc-100 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            En Drive ({videos.length})
          </button>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-64">
          <Input
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-xs bg-zinc-900/60 border-zinc-800"
          />
        </div>
      </div>

      {/* Content Section: Loading, Empty or Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-zinc-500 mb-3" />
          <p className="text-sm text-zinc-400">Cargando videos desde Google Drive...</p>
        </div>
      ) : videos.length === 0 ? (
        /* Empty State with Actionable Guidance */
        <div className="flex flex-col items-center justify-center p-12 md:p-16 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 my-4 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-inner">
            <FolderOpen className="h-7 w-7 text-zinc-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-200 mb-1">
              No hay videos en Drive aún
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
              Los videos renderizados con HyperFrames se suben automáticamente a tu carpeta de Google Drive.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 text-left text-xs text-zinc-300 max-w-md w-full space-y-2">
            <div className="font-semibold text-zinc-200 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              ¿Acabas de renderizar un video?
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              1. El proceso toma alrededor de <strong>1 a 2 minutos</strong> en GitHub Actions.<br />
              2. Una vez completado, haz clic en el botón <strong>&quot;Sincronizar&quot;</strong> arriba para actualizar la lista.<br />
              3. Puedes ver el estado de la tarea en tiempo real en GitHub Actions.
            </p>
            <div className="pt-1">
              <a
                href="https://github.com/jerepe244-coder/zyrvae-media-studio-desde-cero-es/actions/workflows/render-video.yml"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 underline font-medium"
              >
                Ver ejecuciones en GitHub Actions
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="shadow-lg shadow-white/5 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-medium gap-2 text-xs"
              size="default"
            >
              <Plus className="h-4 w-4" />
              + Crear Video en Estudio
            </Button>
            <Button
              variant="outline"
              onClick={() => handleManualRefresh()}
              disabled={isRefreshing}
              className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 gap-2 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-emerald-400" : ""}`} />
              Sincronizar Ahora
            </Button>
          </div>
        </div>
      ) : filteredVideos.length === 0 ? (
        /* Search or Filter No Results */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-800/60 bg-zinc-950/20 my-4">
          <p className="text-sm text-zinc-400">
            No se encontraron videos que coincidan con la búsqueda.
          </p>
        </div>
      ) : (
        /* Cards Grid */
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          <AnimatePresence>
            {filteredVideos.map((video, idx) => {
              const accentColor = GRADIENT_PALETTES[idx % GRADIENT_PALETTES.length]

              return (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, delay: idx * 0.05 }}
                >
                  <Card className="group overflow-hidden border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700/80 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-black/50">
                    <div>
                      {/* Thumbnail Placeholder with Drive Thumbnail Support */}
                      <div className="relative aspect-video w-full overflow-hidden bg-zinc-950 border-b border-zinc-800/60">
                        {/* Stylized background glow */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${accentColor} opacity-70 group-hover:opacity-90 transition-opacity`}
                        />

                        {/* Drive Thumbnail if available */}
                        {video.thumbnail && (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              ;(e.currentTarget as HTMLElement).style.display = "none"
                            }}
                          />
                        )}

                        {/* Subtle overlay for badge readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/40 pointer-events-none" />

                        {/* Grid overlay for video production aesthetic */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a20_1px,transparent_1px),linear-gradient(to_bottom,#27272a20_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                        {/* Top status & badge inside thumbnail: siempre "En Drive" */}
                        <div className="absolute top-3 left-3 z-10">
                          {renderBadge("En Drive")}
                        </div>

                        <div className="absolute top-3 right-3 z-10">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 text-zinc-300">
                            MP4 • HD
                          </span>
                        </div>

                        {/* Center Play Icon Placeholder / Direct Link */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          {video.driveLink ? (
                            <a
                              href={video.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-11 h-11 rounded-full bg-zinc-950/70 border border-zinc-700/60 flex items-center justify-center backdrop-blur-md text-zinc-200 group-hover:scale-110 group-hover:bg-zinc-100 group-hover:text-zinc-950 transition-all duration-200 shadow-lg cursor-pointer z-10"
                              title="Ver video en Google Drive"
                            >
                              <Play className="h-4 w-4 ml-0.5 fill-current" />
                            </a>
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-zinc-950/70 border border-zinc-700/60 flex items-center justify-center backdrop-blur-md text-zinc-200 group-hover:scale-110 group-hover:bg-zinc-100 group-hover:text-zinc-950 transition-all duration-200 shadow-lg">
                              <Play className="h-4 w-4 ml-0.5 fill-current" />
                            </div>
                          )}
                        </div>

                        {/* Category tag at bottom left */}
                        <div className="absolute bottom-2 left-2 text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-800/50 text-zinc-400">
                          Video ZYRVAE
                        </div>
                      </div>

                      {/* Card Content / Metadata */}
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h2
                            className="font-semibold text-zinc-100 group-hover:text-white transition-colors line-clamp-1 text-base"
                            title={video.title}
                          >
                            {video.title}
                          </h2>
                        </div>

                        <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                          <span className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Clock className="h-3 w-3 text-zinc-400" />
                            {video.date}
                          </span>

                          {video.driveLink ? (
                            <a
                              href={video.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors flex items-center gap-1"
                            >
                              <HardDrive className="h-3 w-3 text-emerald-500" />
                              Drive Sincronizado
                            </a>
                          ) : (
                            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                              <HardDrive className="h-3 w-3 text-emerald-500" />
                              Drive Sincronizado
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="px-4 pb-4 pt-1 border-t border-zinc-800/40 flex items-center justify-between gap-2">
                      {video.downloadLink ? (
                        <a
                          href={video.downloadLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1"
                          title="Descargar video MP4 a este dispositivo"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs font-medium border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 transition-colors gap-1.5"
                          >
                            <Download className="h-3 w-3 text-indigo-400" />
                            Descargar
                          </Button>
                        </a>
                      ) : null}

                      {video.driveLink ? (
                        <a
                          href={video.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={video.downloadLink ? "flex-1" : "w-full"}
                          title="Abrir en Google Drive"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs font-medium border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 transition-colors gap-1.5"
                          >
                            <HardDrive className="h-3 w-3 text-emerald-400" />
                            Ver en Drive
                            <ExternalLink className="h-3 w-3 text-zinc-500" />
                          </Button>
                        </a>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="w-full text-xs font-medium border-zinc-800 text-zinc-500 gap-1.5"
                        >
                          Enlace no disponible
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}
