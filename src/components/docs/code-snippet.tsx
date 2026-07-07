import { useState } from "react"

import { Button } from "@/components/ui/button"

type CodeSnippetProps = {
  code: string
}

export function CodeSnippet({ code }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Code</h3>
        <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}
