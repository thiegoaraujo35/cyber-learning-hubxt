import { Suspense } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadError, ModuleHeader, NeedsLogin } from "@/components/crud/module-shell";
import { MonthlyChart, type MonthlyPoint } from "@/components/dashboard/monthly-chart";
import { StatStrip, type Stat } from "@/components/dashboard/stat-strip";
import { getSession } from "@/lib/data";
import { lastMonths, todayISO } from "@/lib/dates";
import {
  CERT_STATUS,
  CERT_STATUS_LABEL,
  COURSE_STATUS,
  COURSE_STATUS_LABEL,
  LAB_DIFFICULTY,
  LAB_DIFFICULTY_LABEL,
} from "@/lib/types";

export const metadata = { title: "Relatórios — Cyber Learning Hub" };

const EXPORT_LINKS = [
  { tipo: "cursos", label: "Cursos" },
  { tipo: "certificacoes", label: "Certificações" },
  { tipo: "laboratorios", label: "Laboratórios" },
  { tipo: "sessoes", label: "Sessões de estudo" },
];

export default function Page() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <ModuleHeader title="Relatórios" description="Relatórios de desempenho e histórico." />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}>
        <Content />
      </Suspense>
    </div>
  );
}

function Breakdown({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  const total = rows.reduce((s, r) => s + r.value, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
        <CardDescription>{total} no total</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-3">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="tabular-nums">{r.value}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#ff8a3d] to-[#ff4d6d]"
                  style={{ width: total === 0 ? "0%" : `${(r.value / total) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

async function Content() {
  const session = await getSession();
  if (!session) return <NeedsLogin />;

  const { supabase } = session;
  const [courses, certs, labs, sessions] = await Promise.all([
    supabase.from("courses").select("status"),
    supabase.from("certifications").select("status"),
    supabase.from("labs").select("difficulty,status"),
    supabase.from("study_sessions").select("studied_on,minutes"),
  ]);
  if (courses.error || certs.error || labs.error || sessions.error) return <LoadError />;

  const today = todayISO();
  const months = lastMonths(today, 6);
  const minutesByMonth = new Map<string, number>();
  let totalMinutes = 0;
  const studyDays = new Set<string>();
  for (const s of sessions.data ?? []) {
    totalMinutes += s.minutes;
    studyDays.add(s.studied_on);
    const key = s.studied_on.slice(0, 7);
    minutesByMonth.set(key, (minutesByMonth.get(key) ?? 0) + s.minutes);
  }

  const monthly: MonthlyPoint[] = months.map((m) => ({
    month: m.label,
    hours: Math.round(((minutesByMonth.get(m.key) ?? 0) / 60) * 10) / 10,
  }));
  const last6Hours = monthly.reduce((s, m) => s + m.hours, 0);

  const stats: Stat[] = [
    { label: "Horas estudadas (total)", value: Math.round((totalMinutes / 60) * 10) / 10 },
    { label: "Horas nos últimos 6 meses", value: Math.round(last6Hours * 10) / 10 },
    { label: "Dias com estudo", value: studyDays.size },
    { label: "Sessões registradas", value: (sessions.data ?? []).length },
  ];

  const countBy = <T extends Record<string, unknown>>(rows: T[], field: keyof T, value: string) =>
    rows.filter((r) => r[field] === value).length;

  return (
    <>
      <StatStrip stats={stats} />

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Horas de estudo por mês</CardTitle>
          <CardDescription>Últimos 6 meses.</CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyChart data={monthly} />
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Breakdown
          title="Cursos por status"
          rows={COURSE_STATUS.map((s) => ({ label: COURSE_STATUS_LABEL[s], value: countBy(courses.data ?? [], "status", s) }))}
        />
        <Breakdown
          title="Certificações por status"
          rows={CERT_STATUS.map((s) => ({ label: CERT_STATUS_LABEL[s], value: countBy(certs.data ?? [], "status", s) }))}
        />
        <Breakdown
          title="Laboratórios concluídos por dificuldade"
          rows={LAB_DIFFICULTY.map((d) => ({
            label: LAB_DIFFICULTY_LABEL[d],
            value: (labs.data ?? []).filter((l) => l.difficulty === d && l.status === "concluido").length,
          }))}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Exportar dados (CSV)</CardTitle>
          <CardDescription>Abre no Excel ou Google Planilhas.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {EXPORT_LINKS.map((e) => (
            <Button key={e.tipo} asChild variant="outline">
              <a href={`/relatorios/export?tipo=${e.tipo}`} download>
                <Download /> {e.label}
              </a>
            </Button>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
