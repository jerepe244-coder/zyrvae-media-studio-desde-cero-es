"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Play,
  Clock,
  HardDrive,
  Film,
  Sparkles,
  ArrowRight,
  MoreVertical,
  SlidersHorizontal,
  CheckCircle2,
  RefreshCw,
  FileEdit,
  FolderOpen
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

interface VideoCardData {
  id: string
  title: string
  date: string
  status: VideoStatus
  duration: string
  aspectRatio: string
  category: string
  accentColor: string
}

const mockVideos: VideoCardData[] = [
  {
    id: "vid-1",
    title: "Comercial La Fresque",
    date: "Hoy, 14:20",
    status: "En Drive",
    duration: "0:30",
    aspectRatio: "16:9 • 4K",
    category: "Comercial ZYRVAE",
    accentColor: "from-emerald-500/20 via-zinc-900 to-zinc-950",
  },
  {
    id: "vid-2",
    title: "Promo ZYRVAE Summer",
    date: "Hace 12 min",
    status: "Renderizando",
    duration: "0:15",
    aspectRatio: "9:16 • Reel",
    category: "Reel",
    accentColor: "from-amber-500/20 via-zinc-900 to-zinc-950",
  },
  {
    id: "vid-3",
    title: "Campaña Black Friday - Hero",
    date: "Ayer, 18:45",
    status: "En Drive",
    duration: "0:45",
    aspectRatio: "16:9 • 1080p",
    category: "Comercial ZYRVAE",
    accentColor: "from-purple-500/20 via-zinc-900 to-zinc-950",
  },
  {
    id: "vid-4",
    title: "Lanzamiento Producto Neo",
    date: "2 Nov 2026",
    status: "Borrador",
    duration: "0:30",
    aspectRatio: "9:16 • Story",
    category: "Reel",
    accentColor: "from-blue-500/20 via-zinc-900 to-zinc-950",
  },
  {
    id: "vid-5",
    title: "Caso de Éxito: Retail Innovación",
    date: "28 Oct 2026",
    status: "En Drive",
    duration: "1:20",
    aspectRatio: "16:9 • 4K",
    category: "Caso de Éxito",
    accentColor: "from-cyan-500/20 via-zinc-900 to-zinc-950",
  },
  {
    id: "vid-6",
    title: "Teaser Otoño 2026",
    date: "24 Oct 2026",
    status: "Borrador",
    duration: "0:15",
    aspectRatio: "9:16 • Reel",
    category: "Reel",
    accentColor: "from-rose-500/20 via-zinc-900 to-zinc-950",
  },
]

export default function LibraryPage() {
  const [filter, setFilter] = React.useState<"all" | VideoStatus>("all")
  const [search, setSearch] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [newVideoTitle, setNewVideoTitle] = React.useState("")
  const [newVideoTemplate, setNewVideoTemplate] = React.useState("Comercial ZYRVAE")

  const filteredVideos = React.useMemo(() => {
    return mockVideos.filter((video) => {
      const matchesFilter = filter === "all" || video.status === filter
      const matchesSearch =
        video.title.toLowerCase().includes(search.toLowerCase()) ||
        video.category.toLowerCase().includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [filter, search])

  const renderBadge = (status: VideoStatus) => {
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
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">
              Biblioteca
            </h1>
            <Badge variant="secondary" className="text-[11px] font-mono text-zinc-400">
              {mockVideos.length} videos
            </Badge>
          </div>
          <p className="text-sm text-zinc-400">
            Administra tus comerciales, visualiza estados de renderizado y accede a copias en Drive.
          </p>
        </div>

        {/* Top Right Button: + Nuevo Video with Modal Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full md:w-auto shadow-lg shadow-white/5 bg-zinc-50 hover:bg-zinc-200 text-zinc-950 font-medium gap-2"
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
                    <SelectItem value="Reel">Reel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="w-full sm:w-auto border-zinc-800 text-zinc-300 hover:bg-zinc-900"
              >
                Cancelar
              </Button>
              <Link href="/studio" className="w-full sm:w-auto">
                <Button
                  className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-medium"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Ir al Estudio
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Button
            variant={filter === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
            className="text-xs h-8 rounded-lg"
          >
            Todos ({mockVideos.length})
          </Button>
          <Button
            variant={filter === "En Drive" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("En Drive")}
            className="text-xs h-8 rounded-lg gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            En Drive
          </Button>
          <Button
            variant={filter === "Renderizando" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("Renderizando")}
            className="text-xs h-8 rounded-lg gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Renderizando
          </Button>
          <Button
            variant={filter === "Borrador" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("Borrador")}
            className="text-xs h-8 rounded-lg gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
            Borradores
          </Button>
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

      {/* Cards Grid */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredVideos.map((video, idx) => (
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
                  {/* Thumbnail Placeholder */}
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-950 border-b border-zinc-800/60">
                    {/* Stylized background glow */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${video.accentColor} opacity-70 group-hover:opacity-90 transition-opacity`}
                    />
                    
                    {/* Grid overlay for video production aesthetic */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#27272a20_1px,transparent_1px),linear-gradient(to_bottom,#27272a20_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                    {/* Top status & badge inside thumbnail */}
                    <div className="absolute top-3 left-3 z-10">
                      {renderBadge(video.status)}
                    </div>

                    <div className="absolute top-3 right-3 z-10">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-950/80 backdrop-blur-md border border-zinc-800/80 text-zinc-300">
                        {video.aspectRatio}
                      </span>
                    </div>

                    {/* Center Play Icon Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-zinc-950/70 border border-zinc-700/60 flex items-center justify-center backdrop-blur-md text-zinc-200 group-hover:scale-110 group-hover:bg-zinc-100 group-hover:text-zinc-950 transition-all duration-200 shadow-lg">
                        <Play className="h-4 w-4 ml-0.5 fill-current" />
                      </div>
                    </div>

                    {/* Duration badge at bottom right */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-zinc-300">
                      <Clock className="h-3 w-3 text-zinc-400" />
                      {video.duration}
                    </div>

                    {/* Category tag at bottom left */}
                    <div className="absolute bottom-2 left-2 text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded bg-zinc-900/80 border border-zinc-800/50 text-zinc-400">
                      {video.category}
                    </div>
                  </div>

                  {/* Card Content / Metadata */}
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="font-semibold text-zinc-100 group-hover:text-white transition-colors line-clamp-1 text-base">
                        {video.title}
                      </h2>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                      <span className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Clock className="h-3 w-3 text-zinc-400" />
                        {video.date}
                      </span>

                      {video.status === "En Drive" ? (
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                          <HardDrive className="h-3 w-3 text-emerald-500" />
                          Drive Sincronizado
                        </span>
                      ) : video.status === "Renderizando" ? (
                        <span className="text-[11px] text-amber-400/90 flex items-center gap-1">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          68% Completado
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                          <FileEdit className="h-3 w-3" />
                          Sin exportar
                        </span>
                      )}
                    </div>
                  </CardContent>
                </div>

                {/* Card Action Footer */}
                <div className="px-4 pb-4 pt-1 flex items-center gap-2 border-t border-zinc-800/40">
                  <Link href="/studio" className="w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-medium border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white justify-between group/btn"
                    >
                      <span>Abrir en Estudio</span>
                      <ArrowRight className="h-3 w-3 text-zinc-400 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
