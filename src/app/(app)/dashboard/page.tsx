import Link from "next/link";
import { ArrowRight, GraduationCap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatStrip, type Stat } from "@/components/dashboard/stat-strip";
import { WeeklyChart, type WeeklyPoint } from "@/components/dashboard/weekly-chart";

export const metadata = { title: "Dashboard — Cyber Learning Hub" };

/**
 * Etapa 1: ainda não há tabelas nem cadastro de dados (Etapa 2).
 * Os indicadores mostram 0 porque nada foi registrado — não são dados fictícios.
 * A Etapa 2 substitui estes valores por consultas ao Supabase (RLS por usuário).
 */
const stats: Stat[] = [
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

const chips = ["Next.js", "Supabase", "PostgreSQL", "Recharts", "Vercel"];

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
            <Link href="/learning-paths">
              Criar uma trilha <ArrowRight />
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

      <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          Nenhum dado registrado ainda. Os indicadores serão preenchidos quando o cadastro de
          cursos, certificações e laboratórios estiver disponível (Etapa 2).
        </p>
      </div>

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
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhuma atividade registrada.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
