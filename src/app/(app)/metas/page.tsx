import { Suspense } from "react";
import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModuleHeader, EmptyState, LoadError, NeedsLogin } from "@/components/crud/module-shell";
import { ResourceForm, type Field } from "@/components/crud/resource-form";
import { ResourceItem } from "@/components/crud/resource-item";
import { getSession } from "@/lib/data";
import { formatDate, todayISO } from "@/lib/dates";
import { GOAL_STATUS_LABEL, GOAL_STATUS_TONE, toOptions, type Goal } from "@/lib/types";
import { deleteGoal, saveGoal } from "./actions";

export const metadata = { title: "Metas e planejamento — Cyber Learning Hub" };

const FIELDS: Field[] = [
  { name: "title", label: "Meta", type: "text", required: true, wide: true, placeholder: "Ex.: Passar na Security+ até março" },
  { name: "target_date", label: "Prazo", type: "date" },
  { name: "status", label: "Status", type: "select", options: toOptions(GOAL_STATUS_LABEL) },
  { name: "description", label: "Detalhes", type: "textarea" },
];

type Upcoming = { key: string; date: string; label: string; kind: string };

export default function Page({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <ModuleHeader title="Metas e planejamento" description="Metas e cronograma de estudos." />
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

  const today = todayISO();
  const [goalsRes, examsRes] = await Promise.all([
    session.supabase
      .from("goals")
      .select("id,title,description,target_date,status")
      .order("created_at", { ascending: false }),
    session.supabase
      .from("certifications")
      .select("id,name,exam_date")
      .gte("exam_date", today)
      .in("status", ["planejada", "estudando", "agendada"]),
  ]);
  if (goalsRes.error || examsRes.error) return <LoadError />;

  const goals = (goalsRes.data ?? []) as Goal[];
  const editing = goals.find((g) => g.id === edit);

  // Cronograma: prazos de metas ativas + provas de certificação futuras, em ordem de data.
  const upcoming: Upcoming[] = [
    ...goals
      .filter((g) => g.status === "ativa" && g.target_date && g.target_date >= today)
      .map((g) => ({ key: `g-${g.id}`, date: g.target_date!, label: g.title, kind: "Meta" })),
    ...(examsRes.data ?? [])
      .filter((c) => c.exam_date)
      .map((c) => ({ key: `c-${c.id}`, date: c.exam_date as string, label: c.name, kind: "Prova" })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <CalendarDays className="size-4 text-primary" /> Cronograma
          </CardTitle>
          <CardDescription>Próximos prazos de metas e provas de certificação.</CardDescription>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum prazo futuro cadastrado.</p>
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.map((u) => (
                <li key={u.key} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="truncate">{u.label}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {u.kind} · <span className="tabular-nums">{formatDate(u.date)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <details open={Boolean(editing)} className="rounded-2xl border border-border bg-card p-5">
        <summary className="cursor-pointer text-sm font-semibold">
          {editing ? `Editando: ${editing.title}` : "+ Nova meta"}
        </summary>
        <div className="mt-4">
          <ResourceForm
            key={editing?.id ?? "nova"}
            fields={FIELDS}
            action={saveGoal}
            values={editing ?? { status: "ativa" }}
            submitLabel={editing ? "Salvar alterações" : "Adicionar meta"}
            cancelHref={editing ? "/metas" : undefined}
          />
        </div>
      </details>

      {goals.length === 0 ? (
        <EmptyState>Nenhuma meta cadastrada ainda. Use “+ Nova meta” para começar.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((g) => (
            <ResourceItem
              key={g.id}
              id={g.id}
              title={g.title}
              badges={[{ label: GOAL_STATUS_LABEL[g.status], tone: GOAL_STATUS_TONE[g.status] }]}
              meta={[g.target_date ? `Prazo: ${formatDate(g.target_date)}` : null]}
              notes={g.description}
              editHref={`/metas?edit=${g.id}`}
              deleteAction={deleteGoal}
            />
          ))}
        </div>
      )}
    </>
  );
}
