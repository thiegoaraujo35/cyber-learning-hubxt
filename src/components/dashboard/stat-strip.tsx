export type Stat = { label: string; value: string | number };

/** Faixa de indicadores com células divididas (estilo AI Interviewer). */
export function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-card p-5">
          <p className="text-3xl font-extrabold tabular-nums tracking-tight sm:text-4xl">{s.value}</p>
          <p className="mt-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}
