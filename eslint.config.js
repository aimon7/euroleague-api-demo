//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  ...tanstackConfig,
  {
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",
    },
  },
  {
    // Vendored shadcn/ui components: keep them close to the generator's output so
    // `shadcn add` stays a clean, reviewable diff. Relax only the type-aware churn
    // rules here, not in our own code.
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "no-shadow": "off",
    },
  },
  {
    ignores: ["eslint.config.js", ".prettierrc", "routeTree.gen.ts", "src/routeTree.gen.ts"],
  },
]
