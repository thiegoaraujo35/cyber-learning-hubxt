"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { FormState } from "@/lib/crud";

export type Field = {
  name: string;
  label: string;
  type: "text" | "url" | "date" | "number" | "password" | "textarea" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  /** Ocupa a linha inteira (2 colunas). */
  wide?: boolean;
};

type Props = {
  fields: Field[];
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  /** Valores iniciais (edição) — chaves = name dos campos; `id` vira campo oculto. */
  values?: Record<string, string | number | null | undefined>;
  submitLabel?: string;
  cancelHref?: string;
  /** Campos ocultos fixos enviados junto (ex.: id da trilha). */
  hiddenFields?: Record<string, string>;
};

export function ResourceForm({ fields, action, values, submitLabel = "Salvar", cancelHref, hiddenFields }: Props) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      {values?.id ? <input type="hidden" name="id" value={String(values.id)} /> : null}
      {hiddenFields &&
        Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}

      {fields.map((f) => {
        const initial = values?.[f.name];
        const defaultValue = initial === null || initial === undefined ? "" : String(initial);
        const id = `field-${f.name}`;
        return (
          <div key={f.name} className={f.wide || f.type === "textarea" ? "flex flex-col gap-1.5 sm:col-span-2" : "flex flex-col gap-1.5"}>
            <Label htmlFor={id}>{f.label}</Label>
            {f.type === "select" ? (
              <Select id={id} name={f.name} defaultValue={defaultValue || f.options?.[0]?.value} required={f.required}>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            ) : f.type === "textarea" ? (
              <Textarea id={id} name={f.name} defaultValue={defaultValue} placeholder={f.placeholder} />
            ) : (
              <Input
                id={id}
                name={f.name}
                type={f.type}
                defaultValue={defaultValue}
                placeholder={f.placeholder}
                required={f.required}
                min={f.min}
                max={f.max}
                step={f.step}
                autoComplete={f.type === "password" ? "new-password" : undefined}
              />
            )}
          </div>
        );
      })}

      {state.message && (
        <p role="status" className="text-sm text-emerald-400 sm:col-span-2">
          {state.message}
        </p>
      )}

      {state.error && (
        <p role="alert" className="text-sm text-destructive sm:col-span-2">
          {state.error}
        </p>
      )}

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : submitLabel}
        </Button>
        {cancelHref && (
          <Button asChild variant="outline">
            <a href={cancelHref}>Cancelar</a>
          </Button>
        )}
      </div>
    </form>
  );
}
