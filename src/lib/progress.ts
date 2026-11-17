import type { Course } from "@/lib/types";

type CourseStatus = Course["status"];

/**
 * Quando o curso tem total de aulas, o progresso vem das aulas concluídas.
 * Retorna null se não há total (progresso continua manual).
 */
export function lessonState(total: number | null, done: number, status: CourseStatus) {
  if (!total) return null;
  const completed = Math.min(Math.max(done, 0), total);
  const progress = Math.round((completed / total) * 100);
  let next: CourseStatus = status;
  if (completed >= total) next = "concluido";
  else if (status === "concluido") next = "em_andamento";
  else if (completed > 0 && status === "planejado") next = "em_andamento";
  return { completed_lessons: completed, progress, status: next };
}
