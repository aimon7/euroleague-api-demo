import type { EuroleagueClient } from "euroleague-api"

import { METHOD_CATALOG } from "./catalog"
import { defaultParamValues } from "./defaults"
import type { MethodDef, PlaygroundContext, ResourceName } from "./types"
import { methodKey } from "./types"

export function getMethodDef(
  resource: ResourceName,
  method: string,
): MethodDef | undefined {
  return METHOD_CATALOG.find(
    (entry) => entry.resource === resource && entry.method === method,
  )
}

export function parseParamValues(
  fields: MethodDef["params"],
  raw: Partial<Record<string, string>>,
): Record<string, unknown> {
  const params: Record<string, unknown> = {}

  for (const field of fields) {
    const value = raw[field.name]
    if (value === undefined || value === "") {
      if (field.required) {
        throw new Error(`${field.label} is required.`)
      }
      continue
    }

    switch (field.kind) {
      case "number": {
        const parsed = Number(value)
        if (!Number.isFinite(parsed)) {
          throw new Error(`${field.label} must be a number.`)
        }
        params[field.name] = parsed
        break
      }
      case "boolean":
        params[field.name] = value === "true"
        break
      default:
        params[field.name] = value
    }
  }

  return params
}

function mergeParamFormValues(
  fields: MethodDef["params"],
  raw: Partial<Record<string, string>>,
  ctx: PlaygroundContext,
): Record<string, string> {
  const defaults = defaultParamValues(fields, ctx)
  const merged: Record<string, string> = {}

  for (const field of fields) {
    const rawValue = raw[field.name]
    if (rawValue !== undefined && rawValue !== "") {
      merged[field.name] = rawValue
      continue
    }

    const fallback = defaults[field.name]
    if (fallback !== undefined) {
      merged[field.name] = String(fallback)
    }
  }

  return merged
}

export function buildInvokeParams(
  fields: MethodDef["params"],
  raw: Partial<Record<string, string>>,
  ctx: PlaygroundContext,
): Record<string, unknown> {
  return parseParamValues(fields, mergeParamFormValues(fields, raw, ctx))
}

export async function invokeMethod(
  client: EuroleagueClient,
  resource: ResourceName,
  method: string,
  params: Record<string, unknown>,
): Promise<unknown> {
  const def = getMethodDef(resource, method)
  if (!def) {
    throw new Error(`Unknown method ${resource}.${method}`)
  }

  if (def.paramsOptional && Object.keys(params).length === 0) {
    return def.invoke(client, {})
  }

  return def.invoke(client, params)
}

export function formatCodeSnippet(
  resource: ResourceName,
  method: string,
  params: Record<string, unknown>,
): string {
  const keys = Object.keys(params)
  const body =
    keys.length === 0
      ? ""
      : JSON.stringify(params, null, 2)
          .split("\n")
          .map((line, index) => (index === 0 ? line : `  ${line}`))
          .join("\n")

  return `const result = await client.${resource}.${method}(${body || ""})`
}

export const RESPONSE_TRUNCATE_BYTES = 48_000

export function serializeResponse(value: unknown): {
  json: string
  truncated: boolean
  byteLength: number
} {
  const json = JSON.stringify(value, null, 2)
  const byteLength = new TextEncoder().encode(json).length

  if (byteLength <= RESPONSE_TRUNCATE_BYTES) {
    return { json, truncated: false, byteLength }
  }

  return {
    json: `${json.slice(0, RESPONSE_TRUNCATE_BYTES)}\n\n/* … truncated (${byteLength.toLocaleString()} bytes total) */`,
    truncated: true,
    byteLength,
  }
}

export function catalogKeys(): string[] {
  return METHOD_CATALOG.map(methodKey)
}

export function methodsForResource(resource: ResourceName): MethodDef[] {
  return METHOD_CATALOG.filter((entry) => entry.resource === resource)
}
