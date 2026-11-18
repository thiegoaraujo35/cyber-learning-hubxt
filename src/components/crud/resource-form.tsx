"use client";

import { useState, type FormEvent } from "react";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type Field = {
  name: string;
  label: string;
  type: "text" | "url" | "date" | "number" | "password" | "email" | "textarea" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  autoComplete?: string;
  /** Ocupa a linha inteira (2 colunas). */
  wide?: boolean;
};

export type FormResult = { error?: string; message?: string } | void;

type Values = Record<string, string | number | null | undefined>;

type Props<S extends z.ZodType> = {
  fields: Field[];
  schema: S;
  /** Recebe os dados já validados. Retorne { error } para mostrar uma falha. */
  onSave: (data: z.output<S>) => Promise<FormResult>;
  values?: Values;
  submitLabel?: string;
  onCancel?: () => void;
  resetOnSuccess?: boolean;
};

export function ResourceForm<S extends z.ZodType>({
  fields,
  schema,
  onSave,
  values,
  submitLabel = "Salvar",
  onCancel,
  resetOnSuccess = false,
}: Props<S>) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError(null);
    setMessage(null);

    const parsed = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setPending(true);
    try {
      const result = await onSave(parsed.data);
      if (result?.error) {
        setError(result.error);
      } else {
        if (result?.message) setMessage(result.message);
        if (resetOnSuccess) form.reset();
      }
    } catch {
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => {
        const initial = values?.[f.name];
        const defaultValue = initial === null || initial === undefined ? "" : String(initial);
        const id = `field-${f.name}`;
        return (
          <div
            key={f.name}
            className={f.wide || f.type === "textarea" ? "flex flex-col gap-1.5 sm:col-span-2" : "flex flex-col gap-1.5"}
          >
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
                autoComplete={f.autoComplete ?? (f.type === "password" ? "new-password" : undefined)}
              />
            )}
          </div>
        );
      })}

      {message && (
        <p role="status" className="text-sm text-emerald-400 sm:col-span-2">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive sm:col-span-2">
          {error}
        </p>
      )}

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
