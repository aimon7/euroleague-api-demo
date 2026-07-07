import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ParamField } from "@/lib/docs/types"

type ParamFormProps = {
  fields: ParamField[]
  values: Record<string, string>
  onChange: (name: string, value: string) => void
}

export function ParamForm({ fields, values, onChange }: ParamFormProps) {
  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This method takes no parameters.
      </p>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={`param-${field.name}`}>
            {field.label}
            {field.required ? (
              <span className="text-destructive"> *</span>
            ) : null}
          </Label>
          {field.kind === "enum" && field.enumValues ? (
            <Select
              value={values[field.name] ?? String(field.defaultValue ?? "")}
              onValueChange={(value) => onChange(field.name, value ?? "")}
            >
              <SelectTrigger id={`param-${field.name}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {field.enumValues.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : field.kind === "boolean" ? (
            <Select
              value={values[field.name] ?? String(field.defaultValue ?? "false")}
              onValueChange={(value) => onChange(field.name, value ?? "false")}
            >
              <SelectTrigger id={`param-${field.name}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">true</SelectItem>
                <SelectItem value="false">false</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={`param-${field.name}`}
              type={field.kind === "number" ? "number" : "text"}
              value={values[field.name] ?? ""}
              onChange={(event) => onChange(field.name, event.target.value)}
            />
          )}
          {field.description ? (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
