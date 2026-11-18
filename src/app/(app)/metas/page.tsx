"use client";

import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CrudModule } from "@/components/crud/crud-module";
import { ModuleHeader } from "@/components/crud/module-shell";
import type { Field } from "@/components/crud/resource-form";
import { ResourceItem } from "@/components/crud/resource-item";
import { fetchRows, useAsync } from "@/lib/db";
import { formatDate, todayISO } from "@/lib/dates";
import { goalSchema } from "@/lib/schemas";
import { GOAL_STATUS_LABEL, GOAL_STATUS_TONE, toOptions, type Goal } from "@/lib/types";

const FIELDS: Field[] = [
  { name: "title", label: "Meta", type: "text", required: true, wide: true, placeholder: "Ex.: Passar na Security+ até março" },
  { name: "target_date", label: "Prazo", type: "date" },
  { name: "status", label: "Status", type: "select", options: toOptions(GOAL_STATUS_LABEL) },
  { name: "description", label: "Detalhes", type: "textarea" },
];

type Exam = { id: string; name: string; exam_date: string | null; status: string };
type Upcoming = { key: string; date: string; label: string; kind: string };

function Cronograma({ goals }: { goals: Goal[] }) {
  const { data: certs } = useAsync(() =>
    fetchRows<Exam>("certifications", "id,name,exam_date,status", { column: "exam_date", ascending: true }),
  );
  const today = todayISO();

  // Cronograma: prazos de metas ativas + provas de certificação futuras, em ordem de data.
  const upcoming: Upcoming[] = [
    ...goals
      .filter((g) => g.status === "ativa" && g.target_date && g.target_date >= today)
      .map((g) => ({ key: `g-${g.id}`, date: g.target_date as string, label: g.title, kind: "Meta" })),
    ...(certs ?? [])
      .filter((c) => c.exam_date && c.exam_date >= today && ["planejada", "estudando", "agendada"].includes(c.status))
      .map((c) => ({ key: `c-${c.id}`, date: c.exam_date as string, label: c.name, kind: "Prova" })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
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
  );
}

export default function Page() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <ModuleHeader title="Metas e planejamento" description="Metas e cronograma de estudos." />
      <CrudModule<Goal, typeof goalSchema>
        table="goals"
        select="id,title,description,target_date,status"
        fields={FIELDS}
        schema={goalSchema}
        defaults={{ status: "ativa" }}
        newLabel="+ Nova meta"
        submitNew="Adicionar meta"
        editTitle={(g) => g.title}
        emptyText="Nenhuma meta cadastrada ainda. Use “Novo” para começar."
        topSlot={(rows) => <Cronograma goals={rows} />}
        renderItem={(g, ctx) => (
          <ResourceItem
            title={g.title}
            badges={[{ label: GOAL_STATUS_LABEL[g.status], tone: GOAL_STATUS_TONE[g.status] }]}
            meta={[g.target_date ? `Prazo: ${formatDate(g.target_date)}` : null]}
            notes={g.description}
            onEdit={ctx.onEdit}
            onDelete={ctx.onDelete}
          />
        )}
      />
    </div>
  );
}
