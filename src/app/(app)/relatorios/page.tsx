"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading, LoadError, ModuleHeader } from "@/components/crud/module-shell";
import { MonthlyChart, type MonthlyPoint } from "@/components/dashboard/monthly-chart";
import { StatStrip, type Stat } from "@/components/dashboard/stat-strip";
import { EXPORTS, downloadText, toCsv, type ExportKey } from "@/lib/csv";
import { fetchRows, useAsync } from "@/lib/db";
import { lastMonths, todayISO } from "@/lib/dates";
import {
  CERT_STATUS,
  CERT_STATUS_LABEL,
  COURSE_STATUS,
  COURSE_STATUS_LABEL,
  LAB_DIFFICULTY,
  LAB_DIFFICULTY_LABEL,
} from "@/lib/types";

type Status = { status: string };
type LabRow = { difficulty: string; status: string };
type SessionRow = { studied_on: string; minutes: number };

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

export default function Page() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <ModuleHeader title="Relatórios" description="Relatórios de desempenho e histórico." />
      <Content />
    </div>
  );
}

function Content() {
  const [exporting, setExporting] = useState<ExportKey | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data, error } = useAsync(async () => {
    const [courses, certs, labs, sessions] = await Promise.all([
      fetchRows<Status>("courses", "status", null),
      fetchRows<Status>("certifications", "status", null),
      fetchRows<LabRow>("labs", "difficulty,status", null),
      fetchRows<SessionRow>("study_sessions", "studied_on,minutes", null),
    ]);
    return { courses, certs, labs, sessions };
  });

  async function exportCsv(key: ExportKey) {
    setExporting(key);
    setExportError(null);
    try {
      const cfg = EXPORTS[key];
      const rows = await fetchRows<Record<string, unknown>>(cfg.table, cfg.columns.join(","), null);
      downloadText(`${key}.csv`, toCsv(cfg.columns, rows));
    } catch {
      setExportError("Não foi possível gerar o arquivo. Tente novamente.");
    } finally {
      setExporting(null);
    }
  }

  if (error) return <LoadError detail={error} />;
  if (!data) return <Loading />;

  const { courses, certs, labs, sessions } = data;
  const months = lastMonths(todayISO(), 6);
  const minutesByMonth = new Map<string, number>();
  const studyDays = new Set<string>();
  let totalMinutes = 0;
  for (const s of sessions) {
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
    { label: "Sessões registradas", value: sessions.length },
  ];

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
          rows={COURSE_STATUS.map((s) => ({ label: COURSE_STATUS_LABEL[s], value: courses.filter((c) => c.status === s).length }))}
        />
        <Breakdown
          title="Certificações por status"
          rows={CERT_STATUS.map((s) => ({ label: CERT_STATUS_LABEL[s], value: certs.filter((c) => c.status === s).length }))}
        />
        <Breakdown
          title="Laboratórios concluídos por dificuldade"
          rows={LAB_DIFFICULTY.map((d) => ({
            label: LAB_DIFFICULTY_LABEL[d],
            value: labs.filter((l) => l.difficulty === d && l.status === "concluido").length,
          }))}
        />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Exportar dados (CSV)</CardTitle>
          <CardDescription>Abre no Excel ou Google Planilhas.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            {(Object.keys(EXPORTS) as ExportKey[]).map((key) => (
              <Button key={key} type="button" variant="outline" disabled={exporting !== null} onClick={() => exportCsv(key)}>
                <Download /> {exporting === key ? "Gerando…" : EXPORTS[key].label}
              </Button>
            ))}
          </div>
          {exportError && (
            <p role="alert" className="text-sm text-destructive">
              {exportError}
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
