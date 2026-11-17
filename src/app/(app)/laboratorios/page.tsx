import { Suspense } from "react";
import { ModuleHeader, EmptyState, LoadError, NeedsLogin } from "@/components/crud/module-shell";
import { ResourceForm, type Field } from "@/components/crud/resource-form";
import { ResourceItem } from "@/components/crud/resource-item";
import { getSession } from "@/lib/data";
import { formatDate } from "@/lib/dates";
import {
  LAB_DIFFICULTY_LABEL,
  LAB_STATUS_LABEL,
  LAB_STATUS_TONE,
  toOptions,
  type Lab,
} from "@/lib/types";
import { deleteLab, saveLab } from "./actions";

export const metadata = { title: "Laboratórios — Cyber Learning Hub" };

const FIELDS: Field[] = [
  { name: "title", label: "Laboratório / sala / máquina", type: "text", required: true, wide: true, placeholder: "Ex.: Blue (TryHackMe)" },
  { name: "platform", label: "Plataforma", type: "text", placeholder: "Ex.: TryHackMe, Hack The Box" },
  { name: "category", label: "Categoria", type: "text", placeholder: "Ex.: Web, Active Directory, Forense" },
  { name: "difficulty", label: "Dificuldade", type: "select", options: toOptions(LAB_DIFFICULTY_LABEL) },
  { name: "status", label: "Status", type: "select", options: toOptions(LAB_STATUS_LABEL) },
  { name: "completed_at", label: "Concluído em", type: "date" },
  { name: "evidence_url", label: "Link da evidência / write-up", type: "url", placeholder: "https://…" },
  { name: "notes", label: "Anotações", type: "textarea" },
];

export default function Page({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <ModuleHeader title="Laboratórios" description="Prática em laboratórios e evidências." />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}>
        <Content searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Content({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const session = await getSession();
  if (!session) return <NeedsLogin />;

  const { data, error } = await session.supabase
    .from("labs")
    .select("id,title,platform,category,difficulty,status,completed_at,evidence_url,notes")
    .order("created_at", { ascending: false });
  if (error) return <LoadError />;

  const labs = (data ?? []) as Lab[];
  const editing = labs.find((l) => l.id === edit);

  return (
    <>
      <details open={Boolean(editing)} className="rounded-2xl border border-border bg-card p-5">
        <summary className="cursor-pointer text-sm font-semibold">
          {editing ? `Editando: ${editing.title}` : "+ Novo laboratório"}
        </summary>
        <div className="mt-4">
          <ResourceForm
            key={editing?.id ?? "novo"}
            fields={FIELDS}
            action={saveLab}
            values={editing ?? { status: "pendente", difficulty: "iniciante" }}
            submitLabel={editing ? "Salvar alterações" : "Adicionar laboratório"}
            cancelHref={editing ? "/laboratorios" : undefined}
          />
        </div>
      </details>

      {labs.length === 0 ? (
        <EmptyState>Nenhum laboratório registrado ainda. Use “+ Novo laboratório” para começar.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {labs.map((l) => (
            <ResourceItem
              key={l.id}
              id={l.id}
              title={l.title}
              subtitle={[l.platform, l.category].filter(Boolean).join(" · ") || null}
              badges={[
                { label: LAB_STATUS_LABEL[l.status], tone: LAB_STATUS_TONE[l.status] },
                { label: LAB_DIFFICULTY_LABEL[l.difficulty], tone: "muted" },
              ]}
              meta={[l.completed_at ? `Concluído em: ${formatDate(l.completed_at)}` : null]}
              notes={l.notes}
              url={l.evidence_url ? { href: l.evidence_url, label: "Ver evidência" } : null}
              editHref={`/laboratorios?edit=${l.id}`}
              deleteAction={deleteLab}
            />
          ))}
        </div>
      )}
    </>
  );
}
