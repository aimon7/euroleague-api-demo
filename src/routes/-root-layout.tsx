import { AppShell } from "@/components/app/app-shell"
import { Outlet } from "@tanstack/react-router"

export function RootLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
