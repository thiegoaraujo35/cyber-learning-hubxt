"use client";

import { Fragment, useState, type ReactNode } from "react";
import type { z } from "zod";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, Loading, LoadError } from "@/components/crud/module-shell";
import { ResourceForm, type Field, type FormResult } from "@/components/crud/resource-form";
import { fetchRows, insertRow, removeRow, updateRow, useAsync } from "@/lib/db";

type Values = Record<string, string | number | null | undefined>;
type Mode = { kind: "closed" } | { kind: "new" } | { kind: "edit"; id: string };

export type ItemContext = { onEdit: () => void; onDelete: () => void; reload: () => void };

type Props<T extends { id: string }, S extends z.ZodType> = {
  table: string;
  select: string;
  fields: Field[];
  schema: S;
  defaults?: Values;
  /** Texto do botão que abre o formulário de criação. */
  newLabel: string;
  /** Rótulo do botão de envio ao criar / editar. */
  submitNew: string;
  /** Título mostrado ao editar um item. */
  editTitle: (row: T) => string;
  emptyText: string;
  /** Ajusta o payload antes de gravar (regras de negócio). */
  prepare?: (data: z.output<S>) => Record<string, unknown>;
  renderItem: (row: T, ctx: ItemContext) => ReactNode;
  /** Conteúdo acima do formulário (recebe as linhas atuais). */
  topSlot?: (rows: T[], reload: () => void) => ReactNode;
  /** Conteúdo entre o formulário e a lista. */
  afterForm?: (reload: () => void) => ReactNode;
  filter?: (row: T) => boolean;
  emptyFilteredText?: string;
};

/** Lista + formulário de criar/editar + exclusão, para qualquer tabela do usuário. */
export function CrudModule<T extends { id: string }, S extends z.ZodType>(p: Props<T, S>) {
  const { data: rows, error, reload } = useAsync(() => fetchRows<T>(p.table, p.select));
  const [mode, setMode] = useState<Mode>({ kind: "closed" });
  const [actionError, setActionError] = useState<string | null>(null);

  if (error) return <LoadError detail={error} />;
  if (!rows) return <Loading />;

  const editing = mode.kind === "edit" ? rows.find((r) => r.id === mode.id) : undefined;
  const visible = p.filter ? rows.filter(p.filter) : rows;

  async function save(data: z.output<S>): Promise<FormResult> {
    const payload = p.prepare ? p.prepare(data) : data;
    const err =
      mode.kind === "edit" ? await updateRow(p.table, mode.id, payload) : await insertRow(p.table, payload);
    if (err) return { error: err };
    setMode({ kind: "closed" });
    reload();
  }

  const ctxFor = (row: T): ItemContext => ({
    reload,
    onEdit: () => {
      setMode({ kind: "edit", id: row.id });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    onDelete: async () => {
      setActionError(null);
      const err = await removeRow(p.table, row.id);
      if (err) setActionError(err);
      reload();
    },
  });

  const open = mode.kind !== "closed";

  return (
    <>
      {p.topSlot?.(rows, reload)}

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">
            {editing ? `Editando: ${p.editTitle(editing)}` : open ? p.newLabel.replace(/^\+\s*/, "") : p.newLabel}
          </p>
          <Button
            type="button"
            size="sm"
            variant={open ? "outline" : "default"}
            onClick={() => setMode(open ? { kind: "closed" } : { kind: "new" })}
          >
            {open ? (
              <>
                <X /> Fechar
              </>
            ) : (
              <>
                <Plus /> Novo
              </>
            )}
          </Button>
        </div>
        {open && (
          <div className="mt-4">
            <ResourceForm
              key={editing?.id ?? "novo"}
              fields={p.fields}
              schema={p.schema}
              onSave={save}
              values={(editing as unknown as Values | undefined) ?? p.defaults}
              submitLabel={editing ? "Salvar alterações" : p.submitNew}
              onCancel={() => setMode({ kind: "closed" })}
            />
          </div>
        )}
      </Card>

      {p.afterForm?.(reload)}

      {actionError && (
        <p role="alert" className="text-sm text-destructive">
          {actionError}
        </p>
      )}

      {visible.length === 0 ? (
        <EmptyState>{rows.length === 0 ? p.emptyText : (p.emptyFilteredText ?? "Nada encontrado.")}</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((row) => (
            <Fragment key={row.id}>{p.renderItem(row, ctxFor(row))}</Fragment>
          ))}
        </div>
      )}
    </>
  );
}
