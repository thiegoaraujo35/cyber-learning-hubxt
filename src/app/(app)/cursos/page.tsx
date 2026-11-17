import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ModuleHeader, EmptyState, LoadError, NeedsLogin } from "@/components/crud/module-shell";
import { ResourceForm, type Field } from "@/components/crud/resource-form";
import { ResourceItem } from "@/components/crud/resource-item";
import { getSession } from "@/lib/data";
import { formatDate } from "@/lib/dates";
import {
  COURSE_STATUS_LABEL,
  COURSE_STATUS_TONE,
  toOptions,
  type Course,
} from "@/lib/types";
import { deleteCourse, saveCourse } from "./actions";

export const metadata = { title: "Meus cursos — Cyber Learning Hub" };

const FIELDS: Field[] = [
  { name: "title", label: "Título", type: "text", required: true, wide: true, placeholder: "Ex.: Security+ SY0-701" },
  { name: "provider", label: "Plataforma / instrutor", type: "text", placeholder: "Ex.: Udemy, TryHackMe, Alura" },
  { name: "url", label: "Link do curso", type: "url", placeholder: "https://…" },
  { name: "status", label: "Status", type: "select", options: toOptions(COURSE_STATUS_LABEL) },
  { name: "progress", label: "Progresso (%)", type: "number", min: 0, max: 100, step: 1, required: true },
  { name: "hours_total", label: "Carga horária (h)", type: "number", min: 0, step: 0.5 },
  { name: "started_at", label: "Início", type: "date" },
  { name: "completed_at", label: "Conclusão", type: "date" },
  { name: "notes", label: "Anotações", type: "textarea" },
];

export default function Page({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <ModuleHeader title="Meus cursos" description="Todos os seus cursos em um só lugar." />
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
    .from("courses")
    .select("id,title,provider,url,status,progress,hours_total,started_at,completed_at,notes")
    .order("created_at", { ascending: false });
  if (error) return <LoadError />;

  const courses = (data ?? []) as Course[];
  const editing = courses.find((c) => c.id === edit);

  return (
    <>
      <details open={Boolean(editing)} className="rounded-2xl border border-border bg-card p-5">
        <summary className="cursor-pointer text-sm font-semibold">
          {editing ? `Editando: ${editing.title}` : "+ Novo curso"}
        </summary>
        <div className="mt-4">
          <ResourceForm
            key={editing?.id ?? "novo"}
            fields={FIELDS}
            action={saveCourse}
            values={editing ?? { progress: 0, status: "planejado" }}
            submitLabel={editing ? "Salvar alterações" : "Adicionar curso"}
            cancelHref={editing ? "/cursos" : undefined}
          />
        </div>
      </details>

      {courses.length === 0 ? (
        <EmptyState>Nenhum curso cadastrado ainda. Use “+ Novo curso” para começar.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((c) => (
            <ResourceItem
              key={c.id}
              id={c.id}
              title={c.title}
              subtitle={c.provider}
              badges={[{ label: COURSE_STATUS_LABEL[c.status], tone: COURSE_STATUS_TONE[c.status] }]}
              progress={c.progress}
              meta={[
                c.hours_total ? `${c.hours_total} h de carga horária` : null,
                c.started_at ? `Início: ${formatDate(c.started_at)}` : null,
                c.completed_at ? `Concluído em: ${formatDate(c.completed_at)}` : null,
              ]}
              notes={c.notes}
              url={c.url ? { href: c.url, label: "Abrir curso" } : null}
              editHref={`/cursos?edit=${c.id}`}
              deleteAction={deleteCourse}
            />
          ))}
        </div>
      )}
    </>
  );
}
