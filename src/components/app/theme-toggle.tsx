import { MoonIcon, SunIcon } from "@phosphor-icons/react"

import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const segments = [
  {
    value: "light" as const,
    label: "Change to light mode",
    Icon: SunIcon,
  },
  {
    value: "dark" as const,
    label: "Change to dark mode",
    Icon: MoonIcon,
  },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="inline-flex h-7 items-center rounded-md border border-border bg-background p-0.5">
      {segments.map(({ value, label, Icon }, index) => {
        const isActive = theme === value

        return (
          <Tooltip key={value}>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label={label}
                  aria-pressed={isActive}
                  onClick={() => {
                    if (!isActive) setTheme(value)
                  }}
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/30",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                    index === 0 && "rounded-l-sm",
                    index === segments.length - 1 && "rounded-r-sm"
                  )}
                />
              }
            >
              <Icon className="size-3.5" aria-hidden />
            </TooltipTrigger>
            <TooltipContent side="bottom">{label}</TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
