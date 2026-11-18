"use client";

import { useState } from "react";
import { CrudModule } from "@/components/crud/crud-module";
import { ModuleHeader } from "@/components/crud/module-shell";
import type { Field } from "@/components/crud/resource-form";
import { ResourceItem } from "@/components/crud/resource-item";
import { resourceSchema } from "@/lib/schemas";
import { RESOURCE_KIND, RESOURCE_KIND_LABEL, toOptions, type Resource } from "@/lib/types";
import { cn } from "@/lib/utils";

const FIELDS: Field[] = [
  { name: "title", label: "Título", type: "text", required: true, wide: true, placeholder: "Ex.: OWASP Top 10" },
  { name: "kind", label: "Tipo", type: "select", options: toOptions(RESOURCE_KIND_LABEL) },
  { name: "url", label: "Link", type: "url", placeholder: "https://…" },
  { name: "tags", label: "Tags (separadas por vírgula)", type: "text", wide: true, placeholder: "web, appsec, owasp" },
  { name: "notes", label: "Anotações", type: "textarea" },
];

const chip = (active: boolean) =>
  cn(
    "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
    active
      ? "border-primary/40 bg-primary/10 text-primary"
      : "border-border bg-card text-muted-foreground hover:text-foreground",
  );

export default function Page() {
  const [kind, setKind] = useState<Resource["kind"] | null>(null);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <ModuleHeader title="Biblioteca" description="Materiais e documentação de referência." />
      <CrudModule<Resource, typeof resourceSchema>
        table="resources"
        select="id,title,kind,url,tags,notes"
        fields={FIELDS}
        schema={resourceSchema}
        defaults={{ kind: "documentacao" }}
        newLabel="+ Novo material"
        submitNew="Adicionar material"
        editTitle={(r) => r.title}
        emptyText="Nenhum material cadastrado ainda. Use “Novo” para começar."
        emptyFilteredText="Nenhum material deste tipo."
        filter={(r) => kind === null || r.kind === kind}
        topSlot={(rows) => (
          <div className="flex flex-wrap gap-2">
            <button type="button" className={chip(kind === null)} onClick={() => setKind(null)}>
              Todos ({rows.length})
            </button>
            {RESOURCE_KIND.map((k) => (
              <button key={k} type="button" className={chip(kind === k)} onClick={() => setKind(k)}>
                {RESOURCE_KIND_LABEL[k]} ({rows.filter((r) => r.kind === k).length})
              </button>
            ))}
          </div>
        )}
        renderItem={(r, ctx) => (
          <ResourceItem
            title={r.title}
            subtitle={RESOURCE_KIND_LABEL[r.kind]}
            badges={(r.tags ?? "")
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
              .slice(0, 6)
              .map((t) => ({ label: t, tone: "muted" as const }))}
            notes={r.notes}
            url={r.url ? { href: r.url, label: "Abrir material" } : null}
            onEdit={ctx.onEdit}
            onDelete={ctx.onDelete}
          />
        )}
      />
    </div>
  );
}
