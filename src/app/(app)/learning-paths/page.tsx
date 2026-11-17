import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModuleHeader, EmptyState, LoadError, NeedsLogin } from "@/components/crud/module-shell";
import { ResourceForm, type Field } from "@/components/crud/resource-form";
import { ResourceItem } from "@/components/crud/resource-item";
import { getSession } from "@/lib/data";
import { formatDate } from "@/lib/dates";
import { loadPathData, pathProgress } from "@/lib/paths";
import { PATH_STATUS_LABEL, PATH_STATUS_TONE, toOptions, type LearningPath } from "@/lib/types";
import { deletePath, savePath } from "./actions";

export const metadata = { title: "Learning Paths — Cyber Learning Hub" };

const FIELDS: Field[] = [
  { name: "title", label: "Nome da trilha", type: "text", required: true, wide: true, placeholder: "Ex.: Pentest do zero ao OSCP" },
  { name: "target_date", label: "Prazo", type: "date" },
  { name: "status", label: "Status", type: "select", options: toOptions(PATH_STATUS_LABEL) },
  { name: "description", label: "Descrição", type: "textarea" },
];

export default function Page({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <ModuleHeader title="Learning Paths" description="Trilhas de aprendizagem personalizadas." />
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

  const [pathsRes, data] = await Promise.all([
    session.supabase
      .from("learning_paths")
      .select("id,title,description,target_date,status")
      .order("created_at", { ascending: false }),
    loadPathData(session.supabase),
  ]);
  if (pathsRes.error || !data) return <LoadError />;

  const paths = (pathsRes.data ?? []) as LearningPath[];
  const editing = paths.find((p) => p.id === edit);

  return (
    <>
      <details open={Boolean(editing)} className="rounded-2xl border border-border bg-card p-5">
        <summary className="cursor-pointer text-sm font-semibold">
          {editing ? `Editando: ${editing.title}` : "+ Nova trilha"}
        </summary>
        <div className="mt-4">
          <ResourceForm
            key={editing?.id ?? "nova"}
            fields={FIELDS}
            action={savePath}
            values={editing ?? { status: "ativa" }}
            submitLabel={editing ? "Salvar alterações" : "Criar trilha"}
            cancelHref={editing ? "/learning-paths" : undefined}
          />
        </div>
      </details>

      {paths.length === 0 ? (
        <EmptyState>
          Nenhuma trilha criada ainda. Crie uma trilha e depois adicione cursos, certificações e
          laboratórios a ela.
        </EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {paths.map((p) => {
            const prog = pathProgress(data.items.filter((i) => i.path_id === p.id));
            return (
              <ResourceItem
                key={p.id}
                id={p.id}
                title={p.title}
                badges={[{ label: PATH_STATUS_LABEL[p.status], tone: PATH_STATUS_TONE[p.status] }]}
                progress={prog.percent}
                meta={[
                  `${prog.done} de ${prog.total} itens concluídos`,
                  p.target_date ? `Prazo: ${formatDate(p.target_date)}` : null,
                ]}
                notes={p.description}
                editHref={`/learning-paths?edit=${p.id}`}
                deleteAction={deletePath}
                extra={
                  <Button asChild size="sm" variant="outline" className="self-start">
                    <Link href={`/learning-paths/${p.id}`}>
                      Abrir trilha <ArrowRight />
                    </Link>
                  </Button>
                }
              />
            );
          })}
        </div>
      )}
    </>
  );
}
