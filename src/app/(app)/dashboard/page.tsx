import { Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklyChart, type WeeklyPoint } from "@/components/dashboard/weekly-chart";

export const metadata = { title: "Dashboard — Cyber Learning Hub" };

/**
 * Etapa 1: ainda não há tabelas nem cadastro de dados (Etapa 2).
 * Os indicadores mostram 0 porque nada foi registrado — não são dados fictícios.
 * A Etapa 2 substitui este objeto por consultas ao Supabase (RLS por usuário).
 */
const stats = [
  { label: "Total de cursos", value: 0 },
  { label: "Cursos em andamento", value: 0 },
  { label: "Cursos concluídos", value: 0 },
  { label: "Horas estudadas", value: 0 },
  { label: "Certificações conquistadas", value: 0 },
  { label: "Certificações planejadas", value: 0 },
  { label: "Laboratórios concluídos", value: 0 },
  { label: "Trilhas ativas", value: 0 },
];

const weekly: WeeklyPoint[] = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => ({
  day,
  hours: 0,
}));

export default function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral da sua evolução em Cybersecurity.</p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          Nenhum dado registrado ainda. Os indicadores serão preenchidos quando o cadastro de
          cursos, certificações e laboratórios estiver disponível (Etapa 2).
        </p>
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle>{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

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
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma atividade registrada.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
