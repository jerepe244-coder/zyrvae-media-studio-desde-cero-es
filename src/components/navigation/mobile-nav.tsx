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
  },
  {
    name: "Estudio",
    href: "/studio",
    icon: Clapperboard,
  },
]

export function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/90 px-4 backdrop-blur-xl">
      <Link href="/library" className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-400 flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-zinc-950 fill-zinc-950" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-zinc-100 tracking-wider">ZYRVAE</span>
          <span className="text-[9px] tracking-widest text-zinc-400 -mt-1 uppercase">Media Studio</span>
        </div>
      </Link>
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        UI Live
      </div>
    </header>
  )
}

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/80 flex items-center justify-around z-40 px-6">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href || (item.href === "/library" && pathname === "/")
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-1 px-4 rounded-xl transition-all duration-150",
              isActive
                ? "text-zinc-100 font-semibold"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            <div
              className={cn(
                "p-1.5 rounded-lg transition-all",
                isActive ? "bg-zinc-800 text-zinc-100 shadow-sm" : "text-zinc-400"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[11px]">{item.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
