"use client"

import * as React from "react"
import { Sidebar } from "@/components/navigation/sidebar"
import { MobileHeader, MobileBottomNav } from "@/components/navigation/mobile-nav"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col antialiased selection:bg-zinc-800 selection:text-zinc-100">
      {/* Background ambient lighting subtle glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-15%] left-[20%] w-[500px] h-[500px] rounded-full bg-zinc-800/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-zinc-800/10 blur-[100px]" />
      </div>

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Top Header */}
      <MobileHeader />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 md:pl-64 pb-24 md:pb-12 transition-all">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  )
}
