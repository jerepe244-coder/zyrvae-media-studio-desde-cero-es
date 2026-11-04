import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-zinc-700/60 bg-zinc-800/90 text-zinc-200",
        secondary:
          "border-transparent bg-zinc-800 text-zinc-300",
        destructive:
          "border-red-500/20 bg-red-500/10 text-red-400",
        outline:
          "border-zinc-750 text-zinc-300",
        success:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_-3px_rgba(16,185,129,0.2)]",
        warning:
          "border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_12px_-3px_rgba(245,158,11,0.2)]",
        neutral:
          "border-zinc-700/40 bg-zinc-800/60 text-zinc-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
