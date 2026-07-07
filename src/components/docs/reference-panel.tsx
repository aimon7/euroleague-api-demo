import { Link } from "@tanstack/react-router"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { methodsForResource } from "@/lib/docs/invoke"
import { RESOURCE_NAMES, resolveDocsResource } from "@/lib/docs/types"
import type { ResourceName } from "@/lib/docs/types"
import { buildDocsSearch } from "@/lib/docs-search"
import type { AppSearch } from "@/lib/search"

type ReferencePanelProps = {
  competition: AppSearch["competition"]
  season: number
  resource?: ResourceName
  onResourceChange: (resource: ResourceName) => void
}

export function ReferencePanel({
  competition,
  season,
  resource: resourceProp,
  onResourceChange,
}: ReferencePanelProps) {
  const resource = resolveDocsResource(resourceProp)
  const methods = methodsForResource(resource)

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {RESOURCE_NAMES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onResourceChange(name)}
              className={`block w-full rounded-md px-3 py-2 text-left font-mono text-xs transition-colors ${
                name === resource
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {name}
            </button>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {methods.map((method) => (
          <Card key={`${resource}.${method.method}`}>
            <CardHeader>
              <CardTitle className="font-mono text-sm">
                client.{resource}.{method.method}()
              </CardTitle>
              {method.description ? (
                <CardDescription>{method.description}</CardDescription>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Returns <code>{method.returnType}</code>
              </p>
              {method.params.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parameter</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Required</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {method.params.map((field) => (
                      <TableRow key={field.name}>
                        <TableCell className="font-mono text-xs">
                          {field.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {field.kind === "enum"
                            ? field.enumValues?.join(" | ")
                            : field.kind}
                        </TableCell>
                        <TableCell>
                          {field.required ? "yes" : "no"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No parameters.</p>
              )}
              {method.notes ? (
                <p className="text-xs text-muted-foreground">{method.notes}</p>
              ) : null}
              <Link
                to="/docs"
                search={buildDocsSearch({
                  competition,
                  season,
                  tab: "playground",
                  resource,
                  method: method.method,
                })}
                className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-transparent px-3 text-sm font-medium shadow-xs transition-colors hover:bg-muted"
              >
                Try in playground
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
