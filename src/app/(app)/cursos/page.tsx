import { Suspense } from "react";
import { Plus } from "lucide-react";
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
import { addLesson, deleteCourse, importCourses, saveCourse } from "./actions";

export const metadata = { title: "Meus cursos — Cyber Learning Hub" };

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

  const [coursesRes, platformsRes] = await Promise.all([
    session.supabase
      .from("courses")
      .select(
        "id,title,provider,url,status,progress,hours_total,platform_id,total_lessons,completed_lessons,started_at,completed_at,notes",
      )
      .order("created_at", { ascending: false }),
    session.supabase.from("platforms").select("id,name").order("name"),
  ]);
  if (coursesRes.error || platformsRes.error) return <LoadError />;

  const courses = (coursesRes.data ?? []) as Course[];
  const platforms = platformsRes.data ?? [];
  const platformName = new Map(platforms.map((p) => [p.id, p.name]));
  const editing = courses.find((c) => c.id === edit);

  const platformOptions = [
    { value: "", label: "Sem plataforma cadastrada" },
    ...platforms.map((p) => ({ value: p.id, label: p.name })),
  ];

  const fields: Field[] = [
    { name: "title", label: "Título", type: "text", required: true, wide: true, placeholder: "Ex.: Security+ SY0-701" },
    { name: "platform_id", label: "Plataforma", type: "select", options: platformOptions },
    { name: "provider", label: "Instrutor / observação da origem", type: "text", placeholder: "Ex.: Prof. Fulano" },
    { name: "url", label: "Link do curso", type: "url", wide: true, placeholder: "https://…" },
    { name: "status", label: "Status", type: "select", options: toOptions(COURSE_STATUS_LABEL) },
    { name: "hours_total", label: "Carga horária (h)", type: "number", min: 0, step: 0.5 },
    { name: "total_lessons", label: "Total de aulas (calcula o progresso)", type: "number", min: 1, step: 1 },
    { name: "completed_lessons", label: "Aulas concluídas", type: "number", min: 0, step: 1, required: true },
    { name: "progress", label: "Progresso (%) — usado se não houver total de aulas", type: "number", min: 0, max: 100, step: 1, required: true },
    { name: "started_at", label: "Início", type: "date" },
    { name: "completed_at", label: "Conclusão", type: "date" },
    { name: "notes", label: "Anotações", type: "textarea" },
  ];

  const importFields: Field[] = [
    { name: "platform_id", label: "Plataforma dos cursos", type: "select", wide: true, options: platformOptions },
    {
      name: "links",
      label: "Links dos cursos (um por linha)",
      type: "textarea",
      placeholder: "https://www.udemy.com/course/…\nhttps://www.udemy.com/course/…",
    },
  ];

  return (
    <>
      <details open={Boolean(editing)} className="rounded-2xl border border-border bg-card p-5">
        <summary className="cursor-pointer text-sm font-semibold">
          {editing ? `Editando: ${editing.title}` : "+ Novo curso"}
        </summary>
        <div className="mt-4">
          <ResourceForm
            key={editing?.id ?? "novo"}
            fields={fields}
            action={saveCourse}
            values={editing ?? { progress: 0, completed_lessons: 0, status: "planejado" }}
            submitLabel={editing ? "Salvar alterações" : "Adicionar curso"}
            cancelHref={editing ? "/cursos" : undefined}
          />
        </div>
      </details>

      {!editing && (
        <details className="rounded-2xl border border-border bg-card p-5">
          <summary className="cursor-pointer text-sm font-semibold">
            + Importar vários cursos por link
          </summary>
          <p className="mt-3 text-xs text-muted-foreground">
            Cole os links dos cursos (por exemplo, de uma trilha da Udemy). O título é montado a
            partir do link e você pode ajustar depois. Links já cadastrados são ignorados.
          </p>
          <div className="mt-4">
            <ResourceForm fields={importFields} action={importCourses} submitLabel="Importar cursos" />
          </div>
        </details>
      )}

      {courses.length === 0 ? (
        <EmptyState>Nenhum curso cadastrado ainda. Use “+ Novo curso” para começar.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {courses.map((c) => (
            <ResourceItem
              key={c.id}
              id={c.id}
              title={c.title}
              subtitle={[c.platform_id ? platformName.get(c.platform_id) : null, c.provider]
                .filter(Boolean)
                .join(" · ") || null}
              badges={[{ label: COURSE_STATUS_LABEL[c.status], tone: COURSE_STATUS_TONE[c.status] }]}
              progress={c.progress}
              meta={[
                c.total_lessons ? `${c.completed_lessons} de ${c.total_lessons} aulas` : null,
                c.hours_total ? `${c.hours_total} h de carga horária` : null,
                c.started_at ? `Início: ${formatDate(c.started_at)}` : null,
                c.completed_at ? `Concluído em: ${formatDate(c.completed_at)}` : null,
              ]}
              notes={c.notes}
              url={c.url ? { href: c.url, label: "Abrir curso" } : null}
              editHref={`/cursos?edit=${c.id}`}
              deleteAction={deleteCourse}
              extra={
                c.total_lessons && c.status !== "concluido" ? (
                  <form action={addLesson}>
                    <input type="hidden" name="id" value={c.id} />
                    <Button type="submit" size="sm" variant="outline">
                      <Plus /> 1 aula concluída
                    </Button>
                  </form>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
