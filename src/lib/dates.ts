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
