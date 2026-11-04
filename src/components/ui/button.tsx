import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-50 text-zinc-900 shadow-sm hover:bg-zinc-200 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 font-medium",
        destructive:
          "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
        outline:
          "border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 hover:text-zinc-100 text-zinc-300 backdrop-blur-sm",
        secondary:
          "bg-zinc-800 text-zinc-100 hover:bg-zinc-700/80 border border-zinc-700/40",
        ghost:
          "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60",
        link:
          "text-zinc-400 underline-offset-4 hover:underline hover:text-zinc-100",
        gradient:
          "bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-300 text-zinc-950 font-semibold shadow-lg shadow-white/5 hover:opacity-95 hover:shadow-white/10",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-6 text-sm",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
