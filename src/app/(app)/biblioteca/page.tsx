import Link from "next/link";
import { Suspense } from "react";
import { ModuleHeader, EmptyState, LoadError, NeedsLogin } from "@/components/crud/module-shell";
import { ResourceForm, type Field } from "@/components/crud/resource-form";
import { ResourceItem } from "@/components/crud/resource-item";
import { cn } from "@/lib/utils";
import { getSession } from "@/lib/data";
import { RESOURCE_KIND, RESOURCE_KIND_LABEL, toOptions, type Resource } from "@/lib/types";
import { deleteResource, saveResource } from "./actions";

export const metadata = { title: "Biblioteca — Cyber Learning Hub" };

const FIELDS: Field[] = [
  { name: "title", label: "Título", type: "text", required: true, wide: true, placeholder: "Ex.: OWASP Top 10" },
  { name: "kind", label: "Tipo", type: "select", options: toOptions(RESOURCE_KIND_LABEL) },
  { name: "url", label: "Link", type: "url", placeholder: "https://…" },
  { name: "tags", label: "Tags (separadas por vírgula)", type: "text", wide: true, placeholder: "web, appsec, owasp" },
  { name: "notes", label: "Anotações", type: "textarea" },
];

type SP = Promise<{ edit?: string; tipo?: string }>;

export default function Page({ searchParams }: { searchParams: SP }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <ModuleHeader title="Biblioteca" description="Materiais e documentação de referência." />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}>
        <Content searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Content({ searchParams }: { searchParams: SP }) {
  const { edit, tipo } = await searchParams;
  const session = await getSession();
  if (!session) return <NeedsLogin />;

  const { data, error } = await session.supabase
    .from("resources")
    .select("id,title,kind,url,tags,notes")
    .order("created_at", { ascending: false });
  if (error) return <LoadError />;

  const all = (data ?? []) as Resource[];
  const filter = RESOURCE_KIND.find((k) => k === tipo);
  const resources = filter ? all.filter((r) => r.kind === filter) : all;
  const editing = all.find((r) => r.id === edit);

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
      active
        ? "border-primary/40 bg-primary/10 text-primary"
        : "border-border bg-card text-muted-foreground hover:text-foreground",
    );

  return (
    <>
      <details open={Boolean(editing)} className="rounded-2xl border border-border bg-card p-5">
        <summary className="cursor-pointer text-sm font-semibold">
          {editing ? `Editando: ${editing.title}` : "+ Novo material"}
        </summary>
        <div className="mt-4">
          <ResourceForm
            key={editing?.id ?? "novo"}
            fields={FIELDS}
            action={saveResource}
            values={editing ?? { kind: "documentacao" }}
            submitLabel={editing ? "Salvar alterações" : "Adicionar material"}
            cancelHref={editing ? "/biblioteca" : undefined}
          />
        </div>
      </details>

      <div className="flex flex-wrap gap-2">
        <Link href="/biblioteca" className={chip(!filter)}>
          Todos ({all.length})
        </Link>
        {RESOURCE_KIND.map((k) => (
          <Link key={k} href={`/biblioteca?tipo=${k}`} className={chip(filter === k)}>
            {RESOURCE_KIND_LABEL[k]} ({all.filter((r) => r.kind === k).length})
          </Link>
        ))}
      </div>

      {resources.length === 0 ? (
        <EmptyState>
          {all.length === 0
            ? "Nenhum material cadastrado ainda. Use “+ Novo material” para começar."
            : "Nenhum material deste tipo."}
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {resources.map((r) => (
            <ResourceItem
              key={r.id}
              id={r.id}
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
              editHref={`/biblioteca?edit=${r.id}`}
              deleteAction={deleteResource}
            />
          ))}
        </div>
      )}
    </>
  );
}
