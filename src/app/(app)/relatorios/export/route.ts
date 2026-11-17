import { getSession } from "@/lib/data";

/** Exportação CSV dos próprios dados (RLS garante que só saem linhas do usuário logado). */
const EXPORTS = {
  cursos: {
    table: "courses",
    columns: ["title", "status", "progress", "total_lessons", "completed_lessons", "hours_total", "started_at", "completed_at", "url", "notes"],
  },
  certificacoes: {
    table: "certifications",
    columns: ["name", "issuer", "level", "status", "exam_date", "obtained_at", "expires_at", "credential_url", "notes"],
  },
  laboratorios: {
    table: "labs",
    columns: ["title", "platform", "category", "difficulty", "status", "completed_at", "evidence_url", "notes"],
  },
  sessoes: {
    table: "study_sessions",
    columns: ["studied_on", "minutes", "note"],
  },
} as const;

type ExportKey = keyof typeof EXPORTS;

/** Escapa para CSV e neutraliza injeção de fórmula em planilhas (=, +, -, @). */
function cell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return new Response("Não autenticado.", { status: 401 });

  const tipo = new URL(request.url).searchParams.get("tipo") ?? "";
  if (!(tipo in EXPORTS)) return new Response("Tipo de relatório inválido.", { status: 400 });
  const cfg = EXPORTS[tipo as ExportKey];

  const { data, error } = await session.supabase.from(cfg.table).select(cfg.columns.join(","));
  if (error) return new Response("Erro ao gerar o relatório.", { status: 500 });

  const rows = (data ?? []) as unknown as Record<string, unknown>[];
  const lines = [
    cfg.columns.join(","),
    ...rows.map((row) => cfg.columns.map((c) => cell(row[c])).join(",")),
  ];
  // BOM para o Excel abrir acentos corretamente.
  const body = "\uFEFF" + lines.join("\r\n") + "\r\n";

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${tipo}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
