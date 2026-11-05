"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Film, Clapperboard, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    name: "Biblioteca",
    href: "/library",
    icon: Film,
    description: "Catálogo de videos comerciales",
  },
  {
    name: "Estudio",
    href: "/studio",
    icon: Clapperboard,
    description: "Convertidor HTML a Video",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-800/60 justify-between">
        <Link href="/library" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-zinc-100 via-zinc-300 to-zinc-500 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(255,255,255,0.25)] group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="h-4 w-4 text-zinc-950 fill-zinc-950" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-wider text-sm text-zinc-100 group-hover:text-white transition-colors">
              ZYRVAE
            </span>
            <span className="text-[10px] tracking-widest text-zinc-400 font-mono -mt-1 uppercase">
              Media Studio
            </span>
          </div>
        </Link>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono">
          v1.0
        </span>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-6 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
          Plataforma
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/library" && pathname === "/")
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-zinc-800/80 text-zinc-100 shadow-sm border border-zinc-700/50"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-zinc-100" : "text-zinc-400 group-hover:text-zinc-200"
                )}
              />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-100 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              )}
            </Link>
          )
        })}
      </div>

      {/* Workspace Footer Info */}
      <div className="p-3 border-t border-zinc-800/60">
        <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Workspace Activo
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">Fase 1</span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Modo UI Mock • Listo para producción visual.
          </p>
        </div>
      </div>
    </aside>
  )
}
