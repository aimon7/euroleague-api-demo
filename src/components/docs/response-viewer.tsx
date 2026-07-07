import { useState } from "react"

import { Button } from "@/components/ui/button"
import { serializeResponse } from "@/lib/docs/invoke"

type ResponseViewerProps = {
  value: unknown
}

export function ResponseViewer({ value }: ResponseViewerProps) {
  const [expanded, setExpanded] = useState(false)
  const { json, truncated, byteLength } = serializeResponse(value)
  const display = expanded ? JSON.stringify(value, null, 2) : json

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">Response</h3>
        <span className="text-xs text-muted-foreground">
          {byteLength.toLocaleString()} bytes
          {truncated && !expanded ? " (truncated)" : ""}
        </span>
      </div>
      <pre className="max-h-[32rem] overflow-auto rounded-lg bg-muted/50 p-4 text-xs leading-relaxed">
        <code>{display}</code>
      </pre>
      {truncated ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Show truncated" : "Show full response"}
        </Button>
      ) : null}
    </div>
  )
}
