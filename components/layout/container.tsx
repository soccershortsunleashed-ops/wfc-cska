import { cn } from "@/lib/utils"

interface ContainerProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "narrow" | "wide" | "full"
}

const variantStyles = {
  default: "max-w-7xl",
  narrow: "max-w-4xl",
  wide: "max-w-[1400px]",
  full: "max-w-full",
}

export function Container({
  children,
  className,
  variant = "default",
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 md:px-6",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </div>
  )
}
