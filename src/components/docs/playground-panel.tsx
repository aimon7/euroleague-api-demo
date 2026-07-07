import { useMemo, useState } from "react"

import { QueryError } from "@/components/app/query-error"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CodeSnippet } from "@/components/docs/code-snippet"
import { ParamForm } from "@/components/docs/param-form"
import { ResponseViewer } from "@/components/docs/response-viewer"
import { isResourceName } from "@/lib/docs-search"
import { defaultValuesForMethod } from "@/lib/docs/defaults"
import {
  buildInvokeParams,
  formatCodeSnippet,
  invokeMethod,
} from "@/lib/docs/invoke"
import { METHOD_CATALOG } from "@/lib/docs/catalog"
import type { MethodDef, ResourceName } from "@/lib/docs/types"
import { RESOURCE_NAMES } from "@/lib/docs/types"
import { getClient } from "@/lib/euroleague"
import type { AppSearch } from "@/lib/search"

type PlaygroundPanelProps = {
  competition: AppSearch["competition"]
  season: number
  resource?: ResourceName
  method?: string
  onSelectionChange: (resource: ResourceName, method: string) => void
}

function toFormValues(
  defaults: Record<string, unknown>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(defaults).map(([key, value]) => [key, String(value)]),
  )
}

function resolveResource(resourceProp: ResourceName | undefined): ResourceName {
  if (resourceProp && METHOD_CATALOG.some((entry) => entry.resource === resourceProp)) {
    return resourceProp
  }
  return "seasons"
}

function resolveMethodDef(
  resource: ResourceName,
  methodProp: string | undefined,
): MethodDef {
  const methods = METHOD_CATALOG.filter((entry) => entry.resource === resource)
  return methods.find((entry) => entry.method === methodProp) ?? methods[0]
}

type PlaygroundFormProps = {
  competition: AppSearch["competition"]
  season: number
  resource: ResourceName
  methodDef: MethodDef
  methods: MethodDef[]
  onSelectionChange: (resource: ResourceName, method: string) => void
}

function PlaygroundForm({
  competition,
  season,
  resource,
  methodDef,
  methods,
  onSelectionChange,
}: PlaygroundFormProps) {
  const playgroundCtx = useMemo(
    () => ({ competition, season }),
    [competition, season],
  )
  const defaultFormValues = useMemo(
    () => toFormValues(defaultValuesForMethod(methodDef, playgroundCtx)),
    [methodDef, playgroundCtx],
  )
  const [formValues, setFormValues] = useState(defaultFormValues)
  const [isRunning, setIsRunning] = useState(false)
  const [runError, setRunError] = useState<unknown>(null)
  const [response, setResponse] = useState<unknown>(undefined)

  const parsedParams = useMemo(
    () => buildInvokeParams(methodDef.params, formValues, playgroundCtx),
    [methodDef.params, formValues, playgroundCtx],
  )

  const runPlayground = async () => {
    setIsRunning(true)
    setRunError(null)
    try {
      const params = buildInvokeParams(methodDef.params, formValues, playgroundCtx)
      const client = getClient(competition)
      const result = await invokeMethod(client, resource, methodDef.method, params)
      setResponse(result)
    } catch (error) {
      setRunError(error)
    } finally {
      setIsRunning(false)
    }
  }

  const snippet = formatCodeSnippet(resource, methodDef.method, parsedParams)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <Card>
        <CardHeader>
          <CardTitle>Method</CardTitle>
          <CardDescription>
            Pick a resource and method, then run it against the live API.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="playground-resource">
              Resource
            </label>
            <Select
              value={resource}
              onValueChange={(value) => {
                if (!value || !isResourceName(value)) return
                const first = METHOD_CATALOG.find((entry) => entry.resource === value)
                if (first) onSelectionChange(value, first.method)
              }}
            >
              <SelectTrigger id="playground-resource" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_NAMES.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="playground-method">
              Method
            </label>
            <Select
              value={methodDef.method}
              onValueChange={(value) => {
                if (value) onSelectionChange(resource, value)
              }}
            >
              <SelectTrigger id="playground-method" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {methods.map((entry) => (
                  <SelectItem key={entry.method} value={entry.method}>
                    {entry.method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {methodDef.notes ? (
            <p className="text-xs text-muted-foreground">{methodDef.notes}</p>
          ) : null}
          {methodDef.largeResponse ? (
            <Alert>
              <AlertTitle>Large response</AlertTitle>
              <AlertDescription>
                Round/season aggregations can return very large payloads. Results
                may be truncated in the viewer.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Parameters</CardTitle>
            <CardDescription>
              Returns <code>{methodDef.returnType}</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ParamForm
              fields={methodDef.params}
              values={formValues}
              onChange={(name, value) =>
                setFormValues((prev) => ({ ...prev, [name]: value }))
              }
            />
            <Button
              type="button"
              onClick={() => void runPlayground()}
              disabled={isRunning}
            >
              {isRunning ? "Running…" : "Run"}
            </Button>
            {runError ? (
              <QueryError
                error={runError}
                onRetry={() => void runPlayground()}
              />
            ) : null}
          </CardContent>
        </Card>

        {response !== undefined ? (
          <Card>
            <CardContent className="space-y-6 pt-6">
              <CodeSnippet code={snippet} />
              <ResponseViewer value={response} />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}

export function PlaygroundPanel({
  competition,
  season,
  resource: resourceProp,
  method: methodProp,
  onSelectionChange,
}: PlaygroundPanelProps) {
  const resource = resolveResource(resourceProp)
  const methodDef = resolveMethodDef(resource, methodProp)
  const methods = useMemo(
    () => METHOD_CATALOG.filter((entry) => entry.resource === resource),
    [resource],
  )

  return (
    <PlaygroundForm
      key={`${resource}.${methodDef.method}`}
      competition={competition}
      season={season}
      resource={resource}
      methodDef={methodDef}
      methods={methods}
      onSelectionChange={onSelectionChange}
    />
  )
}
