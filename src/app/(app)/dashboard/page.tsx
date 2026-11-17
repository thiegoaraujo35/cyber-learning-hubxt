import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NeedsLogin } from "@/components/crud/module-shell";
import { ResourceForm, type Field } from "@/components/crud/resource-form";
import { HistoryList, type HistoryItem } from "@/components/dashboard/history-list";
import { StatStrip, type Stat } from "@/components/dashboard/stat-strip";
import { WeeklyChart, type WeeklyPoint } from "@/components/dashboard/weekly-chart";
import { getSession } from "@/lib/data";
import { todayISO, weekDays } from "@/lib/dates";
import { deleteSession, saveSession } from "./actions";

export const metadata = { title: "Dashboard — Cyber Learning Hub" };

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const chips = ["Next.js", "Supabase", "PostgreSQL", "Recharts", "Vercel"];

const EMPTY_STATS: Stat[] = [
  "Total de cursos",
  "Cursos em andamento",
  "Cursos concluídos",
  "Horas estudadas",
  "Certificações conquistadas",
  "Certificações planejadas",
  "Laboratórios concluídos",
  "Trilhas ativas",
].map((label) => ({ label, value: 0 }));

const EMPTY_WEEK: WeeklyPoint[] = DAY_LABELS.map((day) => ({ day, hours: 0 }));

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
          Centralize cursos, certificações, laboratórios e trilhas de aprendizagem em um único
          painel pessoal.
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

      <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando indicadores…</p>}>
        <DashboardData />
      </Suspense>
    </div>
  );
}

async function DashboardData() {
  const session = await getSession();

  if (!session) {
    return (
      <>
        <NeedsLogin />
        <Panels stats={EMPTY_STATS} weekly={EMPTY_WEEK} history={[]} studyForm={null} />
      </>
    );
  }

  const { supabase } = session;
  const [courses, certs, labs, sessions] = await Promise.all([
    supabase.from("courses").select("id,title,status"),
    supabase.from("certifications").select("status"),
    supabase.from("labs").select("status"),
    supabase
      .from("study_sessions")
      .select("id,course_id,studied_on,minutes,note")
      .order("studied_on", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (courses.error || certs.error || labs.error || sessions.error) {
    return (
      <div role="alert" className="rounded-xl border border-destructive/40 bg-card p-4 text-sm text-destructive">
        Não foi possível carregar os indicadores. Confira se a migration da Etapa 2 foi aplicada
        (<code>npx supabase db reset</code>).
      </div>
    );
  }

  const courseRows = courses.data ?? [];
  const certRows = certs.data ?? [];
  const labRows = labs.data ?? [];
  const sessionRows = sessions.data ?? [];

  const count = <T extends { status: string }>(rows: T[], ...statuses: string[]) =>
    rows.filter((r) => statuses.includes(r.status)).length;

  const totalMinutes = sessionRows.reduce((sum, s) => sum + s.minutes, 0);

  const stats: Stat[] = [
    { label: "Total de cursos", value: courseRows.length },
    { label: "Cursos em andamento", value: count(courseRows, "em_andamento") },
    { label: "Cursos concluídos", value: count(courseRows, "concluido") },
    { label: "Horas estudadas", value: Math.round((totalMinutes / 60) * 10) / 10 },
    { label: "Certificações conquistadas", value: count(certRows, "conquistada") },
    { label: "Certificações planejadas", value: count(certRows, "planejada", "estudando", "agendada") },
    { label: "Laboratórios concluídos", value: count(labRows, "concluido") },
    // Trilhas (Learning Paths) chegam na Etapa 4.
    { label: "Trilhas ativas", value: 0 },
  ];

  const today = todayISO();
  const minutesByDay = new Map<string, number>();
  for (const s of sessionRows) {
    minutesByDay.set(s.studied_on, (minutesByDay.get(s.studied_on) ?? 0) + s.minutes);
  }
  const weekly: WeeklyPoint[] = weekDays(today).map((date, i) => ({
    day: DAY_LABELS[i],
    hours: Math.round(((minutesByDay.get(date) ?? 0) / 60) * 10) / 10,
  }));

  const titleById = new Map(courseRows.map((c) => [c.id, c.title]));
  const history: HistoryItem[] = sessionRows.slice(0, 8).map((s) => ({
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
        ...courseRows.map((c) => ({ value: c.id, label: c.title })),
      ],
    },
    { name: "note", label: "Anotação (opcional)", type: "text", wide: true, placeholder: "O que você estudou?" },
  ];

  const nothingYet =
    courseRows.length + certRows.length + labRows.length + sessionRows.length === 0;

  return (
    <>
      {nothingYet && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Nenhum dado registrado ainda. Cadastre cursos, certificações e laboratórios — ou registre
          uma sessão de estudo abaixo — e os indicadores aparecem aqui.
        </p>
      )}
      <Panels
        stats={stats}
        weekly={weekly}
        history={history}
        studyForm={<ResourceForm fields={studyFields} action={saveSession} values={{ studied_on: today }} submitLabel="Registrar estudo" />}
      />
    </>
  );
}

function Panels({
  stats,
  weekly,
  history,
  studyForm,
}: {
  stats: Stat[];
  weekly: WeeklyPoint[];
  history: HistoryItem[];
  studyForm: React.ReactNode;
}) {
  return (
    <>
      <StatStrip stats={stats} />

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Progresso semanal</CardTitle>
            <CardDescription>Horas de estudo por dia da semana atual.</CardDescription>
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
            <HistoryList items={history} deleteAction={deleteSession} />
          </CardContent>
        </Card>
      </section>

      {studyForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Registrar sessão de estudo</CardTitle>
            <CardDescription>Alimenta as horas estudadas, o gráfico semanal e o histórico.</CardDescription>
          </CardHeader>
          <CardContent>{studyForm}</CardContent>
        </Card>
      )}
    </>
  );
}
