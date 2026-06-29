import {
  EuroleagueApiError,
  EuroleagueNetworkError,
  EuroleagueSchemaError,
} from "euroleague-api"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

function describeError(error: unknown): string {
  if (error instanceof EuroleagueApiError) return `The EuroLeague API responded with ${error.status}.`
  if (error instanceof EuroleagueSchemaError) return "The API returned an unexpected shape."
  if (error instanceof EuroleagueNetworkError) return "Could not reach the EuroLeague API."
  return "Something went wrong while loading this data."
}

export function QueryError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTitle>Couldn&apos;t load data</AlertTitle>
      <AlertDescription className="flex flex-col items-start gap-2">
        <span>{describeError(error)}</span>
        {onRetry ? (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}
