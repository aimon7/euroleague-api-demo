// GitHub Pages post-build: the TanStack Start SPA build emits dist/client/_shell.html
// but no index.html. Pages needs index.html at the publish root and 404.html so that
// client-side deep links survive a hard refresh. .nojekyll stops Pages/Jekyll from
// stripping the underscore-prefixed shell and asset files.
import { copyFileSync, writeFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

const dir = resolve(process.cwd(), "dist/client")
const shell = resolve(dir, "_shell.html")

if (!existsSync(shell)) {
  console.error(`[pages] missing ${shell} - did the SPA build run?`)
  process.exit(1)
}

copyFileSync(shell, resolve(dir, "index.html"))
copyFileSync(shell, resolve(dir, "404.html"))
writeFileSync(resolve(dir, ".nojekyll"), "")
console.log("[pages] wrote index.html, 404.html, .nojekyll")
