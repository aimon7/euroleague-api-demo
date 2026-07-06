import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

const sizeClasses = {
  sm: "h-14 w-11",
  md: "h-20 w-16",
  lg: "h-32 w-24 sm:h-36 sm:w-28",
} as const

type PlayerPhotoSize = keyof typeof sizeClasses

interface PlayerPhotoProps {
  src?: string
  alt: string
  fallback: ReactNode
  size?: PlayerPhotoSize
  className?: string
}

/** Portrait frame for player headshots — faces stay visible via top-aligned cover crop. */
export function PlayerPhoto({
  src,
  alt,
  fallback,
  size = "md",
  className,
}: PlayerPhotoProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/10",
        sizeClasses[size],
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="size-full object-cover object-top"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground">
          {fallback}
        </div>
      )}
    </div>
  )
}
