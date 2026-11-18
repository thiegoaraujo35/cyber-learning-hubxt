/** Exportação CSV feita no navegador, com os dados do próprio usuário. */
export const EXPORTS = {
  cursos: {
    label: "Cursos",
    table: "courses",
    columns: ["title", "status", "progress", "total_lessons", "completed_lessons", "hours_total", "started_at", "completed_at", "url", "notes"],
  },
  certificacoes: {
    label: "Certificações",
    table: "certifications",
    columns: ["name", "issuer", "level", "status", "exam_date", "obtained_at", "expires_at", "credential_url", "notes"],
  },
  laboratorios: {
    label: "Laboratórios",
    table: "labs",
    columns: ["title", "platform", "category", "difficulty", "status", "completed_at", "evidence_url", "notes"],
  },
  sessoes: {
    label: "Sessões de estudo",
    table: "study_sessions",
    columns: ["studied_on", "minutes", "note"],
  },
} as const;

export type ExportKey = keyof typeof EXPORTS;

/** Escapa para CSV e neutraliza injeção de fórmula em planilhas (=, +, -, @). */
function cell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv(columns: readonly string[], rows: Record<string, unknown>[]): string {
  const lines = [columns.join(","), ...rows.map((r) => columns.map((c) => cell(r[c])).join(","))];
  // BOM para o Excel abrir acentos corretamente.
  return "\uFEFF" + lines.join("\r\n") + "\r\n";
}

export function downloadText(filename: string, text: string, mime = "text/csv;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
