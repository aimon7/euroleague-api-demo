import type * as Recharts from "recharts"

let rechartsModule: Promise<typeof Recharts> | null = null

export function loadRecharts() {
  rechartsModule ??= import("recharts") as Promise<typeof Recharts>
  return rechartsModule
}

export type RechartsModule = typeof Recharts
