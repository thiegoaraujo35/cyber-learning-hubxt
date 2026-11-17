/** Fuso usado para "hoje" e para a semana do gráfico (Ceará não tem horário de verão). */
export const APP_TZ = "America/Fortaleza";

/** Data de hoje no fuso do app, formato YYYY-MM-DD. */
export function todayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TZ }).format(now);
}

/** Os 7 dias (segunda → domingo) da semana que contém `today`. */
export function weekDays(today: string): string[] {
  const [y, m, d] = today.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1, d));
  const offsetFromMonday = (base.getUTCDay() + 6) % 7;
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(base);
    day.setUTCDate(base.getUTCDate() - offsetFromMonday + i);
    return day.toISOString().slice(0, 10);
  });
}

/** YYYY-MM-DD → DD/MM/YYYY. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/** Os últimos `n` meses (mais antigo → atual) como { key: "YYYY-MM", label }. */
export function lastMonths(today: string, n: number): { key: string; label: string }[] {
  const [y, m] = today.split("-").map(Number);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - (n - 1 - i), 1));
    return {
      key: d.toISOString().slice(0, 7),
      label: `${MONTHS[d.getUTCMonth()]}/${String(d.getUTCFullYear()).slice(2)}`,
    };
  });
}
