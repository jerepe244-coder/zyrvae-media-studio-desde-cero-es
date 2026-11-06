"use client"

import * as React from "react"
import Link from "next/link"
import {
  Plus,
  Play,
  Clock,
  HardDrive,
  Sparkles,
  RefreshCw,
  FolderOpen,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Download,
  Copy,
  Check,
  Eye,
  Trash2,
  Film,
  Layers,
  Smartphone,
  Tag,
  Search,
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
} from "@/components/ui/dialog"
import { TEMPLATES, AdTemplate } from "@/lib/templates"
import {
  getSavedProjects,
  deleteSavedProject,
  SavedProject,
} from "@/lib/user-library"

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

const TEMPLATE_CATEGORIES = [
  "Todas",
  "SaaS & Tech",
  "E-Commerce",
  "Gastronomía",
  "Apps & Móvil",
  "Kinetic & Viral",
  "Educación",
] as const

export default function LibraryPage() {
  // Pestaña principal: "templates" | "my-projects" | "drive"
  const [activeTab, setActiveTab] = React.useState<"templates" | "my-projects" | "drive">("templates")

  // Estado de plantillas
  const [templateCategory, setTemplateCategory] = React.useState<string>("Todas")
  const [templateSearch, setTemplateSearch] = React.useState<string>("")
  const [previewTemplate, setPreviewTemplate] = React.useState<AdTemplate | null>(null)
  const [copiedTemplateId, setCopiedTemplateId] = React.useState<string | null>(null)

  // Estado de proyectos locales del usuario
  const [savedProjects, setSavedProjects] = React.useState<SavedProject[]>([])
  const [projectSearch, setProjectSearch] = React.useState<string>("")
  const [copiedProjectId, setCopiedProjectId] = React.useState<string | null>(null)

  // Estado de Google Drive
  const [videos, setVideos] = React.useState<DriveVideo[]>([])
  const [loadingDrive, setLoadingDrive] = React.useState(true)
  const [isRefreshingDrive, setIsRefreshingDrive] = React.useState(false)
  const [driveConfig, setDriveConfig] = React.useState<DriveApiResponse | null>(null)
  const [driveSearch, setDriveSearch] = React.useState("")

  // Cargar proyectos guardados del usuario (localStorage)
  const refreshSavedProjects = React.useCallback(() => {
    setSavedProjects(getSavedProjects())
  }, [])

  React.useEffect(() => {
    refreshSavedProjects()
    const handleUpdate = () => refreshSavedProjects()
    window.addEventListener("zyrvae_projects_updated", handleUpdate)
    return () => window.removeEventListener("zyrvae_projects_updated", handleUpdate)
  }, [refreshSavedProjects])

  // Cargar videos de Google Drive en segundo plano
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
        if (!ignore) setLoadingDrive(false)
      }
    }
    fetchVideos()
    return () => {
      ignore = true
    }
  }, [])

  const handleManualRefreshDrive = async () => {
    setIsRefreshingDrive(true)
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
      setIsRefreshingDrive(false)
    }
  }

  // Filtrado de Plantillas
  const filteredTemplates = React.useMemo(() => {
    return TEMPLATES.filter((tpl) => {
      const matchesCategory =
        templateCategory === "Todas" || tpl.category === templateCategory
      const matchesSearch =
        tpl.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
        tpl.description.toLowerCase().includes(templateSearch.toLowerCase()) ||
        tpl.category.toLowerCase().includes(templateSearch.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [templateCategory, templateSearch])

  // Filtrado de Proyectos Guardados
  const filteredProjects = React.useMemo(() => {
    return savedProjects.filter((proj) => {
      return (
        proj.title.toLowerCase().includes(projectSearch.toLowerCase()) ||
        (proj.category && proj.category.toLowerCase().includes(projectSearch.toLowerCase()))
      )
    })
  }, [savedProjects, projectSearch])

  // Filtrado de Drive
  const filteredDriveVideos = React.useMemo(() => {
    return videos.filter((video) =>
      video.title.toLowerCase().includes(driveSearch.toLowerCase())
    )
  }, [videos, driveSearch])

  const handleCopyTemplateHtml = async (tpl: AdTemplate, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(tpl.generateHtml(tpl.defaultDuration))
      setCopiedTemplateId(tpl.id)
      setTimeout(() => setCopiedTemplateId(null), 2000)
    } catch (err) {
      console.error("Error al copiar HTML:", err)
    }
  }

  const handleCopyProjectHtml = async (proj: SavedProject, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(proj.htmlCode)
      setCopiedProjectId(proj.id)
      setTimeout(() => setCopiedProjectId(null), 2000)
    } catch (err) {
      console.error("Error al copiar proyecto:", err)
    }
  }

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("¿Estás seguro de que deseas eliminar este proyecto guardado?")) {
      deleteSavedProject(id)
    }
  }

  return (
    <div className="px-4 py-5 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Film className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-400" />
              Biblioteca de Video
            </h1>
            <Badge variant="secondary" className="text-[11px] font-mono text-zinc-300 bg-zinc-800/80 border-zinc-700">
              {TEMPLATES.length} Plantillas • {savedProjects.length} Guardados
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400">
            Explora plantillas animadas de alta conversión, gestiona tus proyectos guardados o sincroniza con la nube.
          </p>
        </div>

        {/* Acceso directo al Estudio */}
        <div className="flex items-center gap-2.5">
          <Link href="/studio">
            <Button
              className="shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold gap-2 text-xs h-9 sm:h-10 px-4 rounded-xl"
              size="default"
            >
              <Plus className="h-4 w-4" />
              Crear en Estudio
            </Button>
          </Link>
        </div>
      </div>

      {/* Selector de Pestañas Superiores */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-950/80 rounded-xl border border-zinc-800 w-full sm:w-fit overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            activeTab === "templates"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Plantillas Publicitarias ({TEMPLATES.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("my-projects")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            activeTab === "my-projects"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          Mis Proyectos ({savedProjects.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("drive")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            activeTab === "drive"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
          }`}
        >
          <HardDrive className="h-3.5 w-3.5" />
          Google Drive ({videos.length})
        </button>
      </div>

      {/* ========================================================= */}
      {/* PESTAÑA 1: PLANTILLAS OFICIALES ANIMADAS LISTAS PARA USAR */}
      {/* ========================================================= */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          {/* Barra de Filtros por Categoría y Buscador */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            {/* Categorías Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {TEMPLATE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setTemplateCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    templateCategory === cat
                      ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                      : "bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Input de Búsqueda */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <Input
                placeholder="Buscar plantillas por nombre o tema..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-zinc-950/70 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Grid de Plantillas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map((template) => {
              const isCopied = copiedTemplateId === template.id

              return (
                <Card
                  key={template.id}
                  className="group relative overflow-hidden border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700/80 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-black/50 rounded-2xl"
                >
                  <div>
                    {/* Visual Preview Banner con degradado temático */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950 border-b border-zinc-800/70 flex flex-col justify-between p-4">
                      {/* Fondo de luz difusa según color del acento */}
                      <div
                        className="absolute inset-0 opacity-20 group-hover:opacity-35 transition-opacity"
                        style={{
                          background: `radial-gradient(circle at 50% 30%, ${template.accentColor} 0%, transparent 70%)`,
                        }}
                      />

                      {/* Header de la tarjeta */}
                      <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-950/80 border border-zinc-800 text-zinc-300 flex items-center gap-1">
                          <Tag className="h-2.5 w-2.5 text-indigo-400" />
                          {template.category}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                          {template.defaultDuration}s • 9:16 HD
                        </span>
                      </div>

                      {/* Centro: botón rápido de vista previa interactiva */}
                      <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center py-2">
                        <button
                          type="button"
                          onClick={() => setPreviewTemplate(template)}
                          className="w-12 h-12 rounded-full bg-zinc-950/80 border border-zinc-700/80 flex items-center justify-center text-zinc-200 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all duration-200 shadow-xl cursor-pointer"
                          title="Previsualizar plantilla animada"
                        >
                          <Play className="h-5 w-5 ml-0.5 fill-current" />
                        </button>
                        <span className="text-[11px] font-medium text-zinc-400 mt-2 group-hover:text-zinc-200 transition-colors">
                          Ver Animación en Vivo
                        </span>
                      </div>

                      {/* Footer de la miniatura */}
                      <div className="relative z-10 flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Smartphone className="h-3 w-3 text-zinc-400" />
                          TikTok / Reels / Shorts
                        </span>
                        {template.badge && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                            {template.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contenido / Metadatos */}
                    <CardContent className="p-4 space-y-2">
                      <h3 className="font-bold text-zinc-100 group-hover:text-white transition-colors text-base line-clamp-1">
                        {template.name}
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                        {template.description}
                      </p>
                    </CardContent>
                  </div>

                  {/* Acciones de la Tarjeta */}
                  <div className="px-4 pb-4 pt-1 border-t border-zinc-800/60 flex items-center gap-2">
                    <Link
                      href={`/studio?template=${template.id}`}
                      className="flex-1"
                    >
                      <Button
                        size="sm"
                        className="w-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors gap-1.5 rounded-lg"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Abrir en Estudio
                      </Button>
                    </Link>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleCopyTemplateHtml(template, e)}
                      className="h-8 px-2.5 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg text-xs"
                      title="Copiar código HTML al portapapeles"
                    >
                      {isCopied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewTemplate(template)}
                      className="h-8 px-2.5 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg text-xs"
                      title="Vista previa completa y código"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PESTAÑA 2: MIS PROYECTOS Y BORRADORES GUARDADOS (LOCAL)   */}
      {/* ========================================================= */}
      {activeTab === "my-projects" && (
        <div className="space-y-6">
          {/* Header de la sección de Proyectos Guardados */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div>
              <p className="text-xs text-zinc-400">
                Tus creaciones se guardan localmente en este navegador para que nunca pierdas tus avances.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <Input
                  placeholder="Buscar en mis proyectos..."
                  value={projectSearch}
                  onChange={(e) => setProjectSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-zinc-950/70 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500"
                />
              </div>

              <Link href="/studio">
                <Button
                  size="sm"
                  className="bg-zinc-100 hover:bg-white text-zinc-950 font-semibold gap-1.5 text-xs h-9"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nuevo Proyecto
                </Button>
              </Link>
            </div>
          </div>

          {filteredProjects.length === 0 ? (
            /* Estado Vacío cuando no hay proyectos */
            <div className="flex flex-col items-center justify-center p-12 md:p-16 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 my-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 shadow-inner">
                <FolderOpen className="h-7 w-7 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-zinc-200">
                  Aún no tienes proyectos guardados
                </h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Cuando crees o edites un video en el Estudio, haz clic en{" "}
                  <strong className="text-zinc-200">&quot;Guardar Proyecto&quot;</strong> para que aparezca aquí listo para volver a editarse en cualquier momento.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  onClick={() => setActiveTab("templates")}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium gap-2 text-xs h-9 px-4 rounded-xl"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Explorar Plantillas Oficiales
                </Button>
                <Link href="/studio">
                  <Button
                    variant="outline"
                    className="border-zinc-800 hover:bg-zinc-900 text-zinc-300 gap-2 text-xs h-9 px-4 rounded-xl"
                  >
                    Abrir Estudio en Blanco
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Grid de Proyectos Guardados */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => {
                const isCopied = copiedProjectId === project.id
                const dateStr = new Date(project.updatedAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })

                return (
                  <Card
                    key={project.id}
                    className="group overflow-hidden border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700/80 transition-all duration-300 flex flex-col justify-between rounded-2xl"
                  >
                    <div>
                      {/* Cabecera de la tarjeta del proyecto */}
                      <div className="p-4 border-b border-zinc-800/60 bg-zinc-950/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-xs font-semibold text-zinc-200 line-clamp-1">
                            {project.title}
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono border-zinc-800 text-zinc-400"
                        >
                          {project.durationSeconds}s • {project.aspectRatio}
                        </Badge>
                      </div>

                      <CardContent className="p-4 space-y-2.5">
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <span className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Clock className="h-3 w-3 text-zinc-500" />
                            {dateStr}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500">
                            {project.htmlCode.length} chars
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-mono line-clamp-2 bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800/60 text-[11px]">
                          {project.htmlCode.substring(0, 150)}...
                        </p>
                      </CardContent>
                    </div>

                    {/* Acciones de Proyecto */}
                    <div className="px-4 pb-4 pt-1 border-t border-zinc-800/60 flex items-center gap-2">
                      <Link
                        href={`/studio?projectId=${project.id}`}
                        className="flex-1"
                      >
                        <Button
                          size="sm"
                          className="w-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors gap-1.5 rounded-lg"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Abrir en Estudio
                        </Button>
                      </Link>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleCopyProjectHtml(project, e)}
                        className="h-8 px-2.5 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg text-xs"
                        title="Copiar código HTML"
                      >
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="h-8 px-2.5 border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-xs"
                        title="Eliminar proyecto guardado"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* PESTAÑA 3: GOOGLE DRIVE (SINCRONIZACIÓN EN LA NUBE)       */}
      {/* ========================================================= */}
      {activeTab === "drive" && (
        <div className="space-y-6">
          {/* Header de Drive con botón Sincronizar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div>
              <p className="text-xs text-zinc-400">
                Videos almacenados en tu carpeta conectada de Google Drive para respaldos en la nube.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <Input
                  placeholder="Buscar en Drive..."
                  value={driveSearch}
                  onChange={(e) => setDriveSearch(e.target.value)}
                  className="pl-9 h-9 text-xs bg-zinc-950/70 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 focus:border-indigo-500"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleManualRefreshDrive()}
                disabled={loadingDrive || isRefreshingDrive}
                className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 gap-2 text-xs h-9"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    isRefreshingDrive ? "animate-spin text-emerald-400" : ""
                  }`}
                />
                Sincronizar
              </Button>
            </div>
          </div>

          {/* Banner si Google Drive no está configurado */}
          {driveConfig?.configured === false && (
            <div className="p-4 rounded-xl border border-amber-900/60 bg-amber-950/20 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-100">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Google Drive no está configurado aún (opcional)
              </div>
              <p className="text-amber-300/90 leading-relaxed text-[11px]">
                El estudio funciona al 100% descargando tus videos MP4 directamente en tu computadora o celular. Si además deseas que se suban a una carpeta de Google Drive, configura las variables de entorno en Vercel:
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-3 font-mono text-[10px] text-amber-400">
                <span>• GOOGLE_CLIENT_EMAIL</span>
                <span>• GOOGLE_PRIVATE_KEY</span>
                <span>• GOOGLE_DRIVE_FOLDER_ID</span>
              </div>
            </div>
          )}

          {/* Lista de videos de Drive */}
          {loadingDrive ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 overflow-hidden animate-pulse p-4 space-y-3"
                >
                  <div className="aspect-video w-full bg-zinc-900/80 rounded-lg" />
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800/50 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredDriveVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/40 my-4 space-y-3">
              <FolderOpen className="h-8 w-8 text-zinc-500" />
              <h4 className="text-sm font-semibold text-zinc-200">
                No hay videos sincronizados en Google Drive
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm">
                Puedes generar videos directamente desde la pestaña de Plantillas o desde el Estudio.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDriveVideos.map((video) => (
                <Card
                  key={video.id}
                  className="group overflow-hidden border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 transition-all rounded-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-video w-full bg-zinc-950 border-b border-zinc-800 relative flex items-center justify-center">
                      {video.thumbnail ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Play className="h-8 w-8 text-zinc-600" />
                      )}
                    </div>
                    <CardContent className="p-4 space-y-1">
                      <h4 className="font-semibold text-zinc-100 text-sm line-clamp-1">
                        {video.title}
                      </h4>
                      <p className="text-[11px] font-mono text-zinc-500">
                        {video.date}
                      </p>
                    </CardContent>
                  </div>
                  <div className="p-4 pt-1 border-t border-zinc-800/60 flex items-center gap-2">
                    {video.downloadLink && (
                      <a
                        href={video.downloadLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-200 gap-1.5"
                        >
                          <Download className="h-3.5 w-3.5 text-indigo-400" />
                          Descargar
                        </Button>
                      </a>
                    )}
                    {video.driveLink && (
                      <a
                        href={video.driveLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={video.downloadLink ? "flex-1" : "w-full"}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs border-zinc-800 hover:bg-zinc-800 text-zinc-200 gap-1.5"
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
                          Ver en Drive
                        </Button>
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VISTA PREVIA INTERACTIVA DE PLANTILLA              */}
      {/* ========================================================= */}
      {previewTemplate && (
        <Dialog
          open={!!previewTemplate}
          onOpenChange={(open) => {
            if (!open) setPreviewTemplate(null)
          }}
        >
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-4xl bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl p-5 sm:p-6 max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div>
                    <DialogTitle className="text-base sm:text-lg font-bold text-white">
                      {previewTemplate.name}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 text-xs">
                      {previewTemplate.category} • Duración recomendada:{" "}
                      {previewTemplate.defaultDuration}s • Proporción 9:16
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-3 items-center">
              {/* Visor 9:16 en Iframe */}
              <div className="md:col-span-5 flex justify-center">
                <div className="relative w-[220px] aspect-[9/16] rounded-[1.8rem] overflow-hidden bg-black border-[3px] border-zinc-800 shadow-2xl">
                  <iframe
                    srcDoc={previewTemplate.generateHtml(previewTemplate.defaultDuration)}
                    title={previewTemplate.name}
                    sandbox="allow-scripts"
                    style={{
                      width: 1080,
                      height: 1920,
                      transform: "scale(0.2037)",
                      transformOrigin: "top left",
                    }}
                    className="border-0 pointer-events-none"
                  />
                </div>
              </div>

              {/* Información y Código */}
              <div className="md:col-span-7 space-y-3.5">
                <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5 text-xs text-zinc-300">
                  <p className="font-semibold text-zinc-100">
                    Descripción del Creativo:
                  </p>
                  <p className="text-zinc-400 leading-relaxed text-[11px]">
                    {previewTemplate.description}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 font-medium">
                      Código HTML listo para Studio:
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      1080 × 1920
                    </span>
                  </div>
                  <pre className="p-3 rounded-xl bg-black border border-zinc-800 text-zinc-300 text-[10px] font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto select-all">
                    {previewTemplate.generateHtml(previewTemplate.defaultDuration)}
                  </pre>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-row items-center justify-between gap-2 pt-3 border-t border-zinc-800/80">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewTemplate(null)}
                className="border-zinc-800 text-zinc-400 hover:text-white"
              >
                Cerrar
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      previewTemplate.generateHtml(previewTemplate.defaultDuration)
                    )
                    alert("¡Código HTML copiado al portapapeles!")
                  }}
                  className="border-zinc-800 text-zinc-300 hover:text-white gap-1.5"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copiar Código
                </Button>
                <Link href={`/studio?template=${previewTemplate.id}`}>
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Abrir en Estudio
                  </Button>
                </Link>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
