import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { ScriptOnce } from "@tanstack/react-router"

type Theme = "dark" | "light"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

function getThemeScript(storageKey: string, defaultTheme: Theme) {
  const key = JSON.stringify(storageKey)
  const fallback = JSON.stringify(defaultTheme)

  return `(function(){try{var t=localStorage.getItem(${key});if(t!=='light'&&t!=='dark'){t=${fallback}}var e=document.documentElement;e.classList.remove('light','dark');e.classList.add(t);e.style.colorScheme=t}catch(e){}})();`
}

function readStoredTheme(storageKey: string, defaultTheme: Theme): Theme {
  if (typeof window === "undefined") return defaultTheme
  const stored = localStorage.getItem(storageKey)
  return stored === "light" || stored === "dark" ? stored : defaultTheme
}

const ThemeProviderContext = createContext<ThemeProviderState | null>(null)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(theme)
  root.style.colorScheme = theme
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() =>
    readStoredTheme(storageKey, defaultTheme)
  )

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const setTheme = useCallback(
    (next: Theme) => {
      localStorage.setItem(storageKey, next)
      setThemeState(next)
    },
    [storageKey]
  )

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return (
    <ThemeProviderContext value={value}>
      <ScriptOnce>{getThemeScript(storageKey, defaultTheme)}</ScriptOnce>
      {children}
    </ThemeProviderContext>
  )
}

export function useTheme() {
  const context = use(ThemeProviderContext)
  if (context === null) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
