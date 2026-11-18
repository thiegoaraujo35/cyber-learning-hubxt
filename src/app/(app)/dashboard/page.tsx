"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading, LoadError } from "@/components/crud/module-shell";
import { ResourceForm, type Field } from "@/components/crud/resource-form";
import { HistoryList, type HistoryItem } from "@/components/dashboard/history-list";
import { StatStrip, type Stat } from "@/components/dashboard/stat-strip";
import { WeeklyChart, type WeeklyPoint } from "@/components/dashboard/weekly-chart";
import { fetchRows, insertRow, removeRow, useAsync } from "@/lib/db";
import { todayISO, weekDays } from "@/lib/dates";
import { sessionSchema } from "@/lib/schemas";
import { getSupabase } from "@/lib/supabase/client";

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const chips = ["Next.js", "Supabase", "PostgreSQL", "Recharts", "GitHub Pages"];

type Status = { status: string };
type CourseRef = { id: string; title: string; status: string };
type SessionRow = { id: string; course_id: string | null; studied_on: string; minutes: number; note: string | null };

async function loadDashboard() {
  const [courses, certs, labs, sessions, paths] = await Promise.all([
    fetchRows<CourseRef>("courses", "id,title,status", null),
    fetchRows<Status>("certifications", "status", null),
    fetchRows<Status>("labs", "status", null),
    fetchRows<SessionRow>("study_sessions", "id,course_id,studied_on,minutes,note", {
      column: "studied_on",
      ascending: false,
    }),
    fetchRows<Status>("learning_paths", "status", null),
  ]);
  const { data: settings, error } = await getSupabase()
    .from("user_settings")
    .select("weekly_goal_hours")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return { courses, certs, labs, sessions, paths, weeklyGoal: settings ? Number(settings.weekly_goal_hours) : null };
}

const count = (rows: Status[], ...statuses: string[]) => rows.filter((r) => statuses.includes(r.status)).length;

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <section className="flex flex-col gap-5 pt-2">
        <p className="eyebrow">● Seus dados · Sua evolução em Cybersecurity</p>
        <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl">
          Estude com foco.
          <br />
          Certifique-se.
          <br />
          <span className="text-gradient">Evolua todo dia.</span>
        </h1>
        <p className="max-w-xl text-muted-foreground">
          Centralize cursos, certificações, laboratórios e trilhas de aprendizagem em um único painel pessoal.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/cursos">
              Cadastrar um curso <ArrowRight />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/certificacoes">
              <GraduationCap /> Ver certificações
            </Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <span
              key={c}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      <DashboardData />
    </div>
  );
}

function DashboardData() {
  const { data, error, reload } = useAsync(loadDashboard);

  if (error) return <LoadError detail={error} />;
  if (!data) return <Loading />;

  const { courses, certs, labs, sessions, paths, weeklyGoal } = data;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0);

  const stats: Stat[] = [
    { label: "Total de cursos", value: courses.length },
    { label: "Cursos em andamento", value: count(courses, "em_andamento") },
    { label: "Cursos concluídos", value: count(courses, "concluido") },
    { label: "Horas estudadas", value: Math.round((totalMinutes / 60) * 10) / 10 },
    { label: "Certificações conquistadas", value: count(certs, "conquistada") },
    { label: "Certificações planejadas", value: count(certs, "planejada", "estudando", "agendada") },
    { label: "Laboratórios concluídos", value: count(labs, "concluido") },
    { label: "Trilhas ativas", value: count(paths, "ativa") },
  ];

  const today = todayISO();
  const minutesByDay = new Map<string, number>();
  for (const s of sessions) minutesByDay.set(s.studied_on, (minutesByDay.get(s.studied_on) ?? 0) + s.minutes);
  const weekly: WeeklyPoint[] = weekDays(today).map((date, i) => ({
    day: DAY_LABELS[i],
    hours: Math.round(((minutesByDay.get(date) ?? 0) / 60) * 10) / 10,
  }));
  const weekHours = Math.round(weekly.reduce((sum, w) => sum + w.hours, 0) * 10) / 10;

  const titleById = new Map(courses.map((c) => [c.id, c.title]));
  const history: HistoryItem[] = sessions.slice(0, 8).map((s) => ({
    id: s.id,
    studied_on: s.studied_on,
    minutes: s.minutes,
    note: s.note,
    courseTitle: s.course_id ? (titleById.get(s.course_id) ?? null) : null,
  }));

  const studyFields: Field[] = [
    { name: "studied_on", label: "Data", type: "date", required: true },
    { name: "minutes", label: "Minutos estudados", type: "number", min: 1, max: 1440, step: 1, required: true, placeholder: "60" },
    {
      name: "course_id",
      label: "Curso",
      type: "select",
      wide: true,
      options: [
        { value: "", label: "Estudo livre (sem curso)" },
        ...courses.map((c) => ({ value: c.id, label: c.title })),
      ],
    },
    { name: "note", label: "Anotação (opcional)", type: "text", wide: true, placeholder: "O que você estudou?" },
  ];

  const nothingYet = courses.length + certs.length + labs.length + sessions.length === 0;

  return (
    <>
      {nothingYet && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Nenhum dado registrado ainda. Cadastre cursos, certificações e laboratórios — ou registre uma sessão
          de estudo abaixo — e os indicadores aparecem aqui.
        </p>
      )}

      <StatStrip stats={stats} />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Progresso semanal</CardTitle>
            <CardDescription>
              Horas de estudo por dia da semana atual.
              {weeklyGoal !== null ? ` Meta semanal: ${weekHours} h de ${weeklyGoal} h.` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyChart data={weekly} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Histórico de aprendizagem</CardTitle>
            <CardDescription>Últimas atividades registradas.</CardDescription>
          </CardHeader>
          <CardContent>
            <HistoryList
              items={history}
              onDelete={async (id) => {
                await removeRow("study_sessions", id);
                reload();
              }}
            />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Registrar sessão de estudo</CardTitle>
          <CardDescription>Alimenta as horas estudadas, o gráfico semanal e o histórico.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResourceForm
            fields={studyFields}
            schema={sessionSchema}
            values={{ studied_on: today }}
            submitLabel="Registrar estudo"
            onSave={async (d) => {
              const err = await insertRow("study_sessions", d);
              if (err) return { error: err };
              reload();
              return { message: "Sessão registrada." };
            }}
          />
        </CardContent>
      </Card>
    </>
  );
}
