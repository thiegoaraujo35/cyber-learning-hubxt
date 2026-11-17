/** Tipos das tabelas da Etapa 2 e rótulos de exibição. */

export type BadgeTone = "default" | "accent" | "muted" | "warning" | "success";

export const COURSE_STATUS = ["planejado", "em_andamento", "concluido", "pausado"] as const;
export const COURSE_STATUS_LABEL: Record<(typeof COURSE_STATUS)[number], string> = {
  planejado: "Planejado",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  pausado: "Pausado",
};
export const COURSE_STATUS_TONE: Record<(typeof COURSE_STATUS)[number], BadgeTone> = {
  planejado: "muted",
  em_andamento: "default",
  concluido: "success",
  pausado: "warning",
};

export const CERT_STATUS = ["planejada", "estudando", "agendada", "conquistada", "expirada"] as const;
export const CERT_STATUS_LABEL: Record<(typeof CERT_STATUS)[number], string> = {
  planejada: "Planejada",
  estudando: "Estudando",
  agendada: "Prova agendada",
  conquistada: "Conquistada",
  expirada: "Expirada",
};
export const CERT_STATUS_TONE: Record<(typeof CERT_STATUS)[number], BadgeTone> = {
  planejada: "muted",
  estudando: "default",
  agendada: "accent",
  conquistada: "success",
  expirada: "warning",
};

export const LAB_STATUS = ["pendente", "em_andamento", "concluido"] as const;
export const LAB_STATUS_LABEL: Record<(typeof LAB_STATUS)[number], string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};
export const LAB_STATUS_TONE: Record<(typeof LAB_STATUS)[number], BadgeTone> = {
  pendente: "muted",
  em_andamento: "default",
  concluido: "success",
};

export const LAB_DIFFICULTY = ["iniciante", "intermediario", "avancado"] as const;
export const LAB_DIFFICULTY_LABEL: Record<(typeof LAB_DIFFICULTY)[number], string> = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
};

export const GOAL_STATUS = ["ativa", "concluida", "cancelada"] as const;
export const GOAL_STATUS_LABEL: Record<(typeof GOAL_STATUS)[number], string> = {
  ativa: "Ativa",
  concluida: "Concluída",
  cancelada: "Cancelada",
};
export const GOAL_STATUS_TONE: Record<(typeof GOAL_STATUS)[number], BadgeTone> = {
  ativa: "default",
  concluida: "success",
  cancelada: "muted",
};

export function toOptions<T extends string>(labels: Record<T, string>) {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}

export type Course = {
  id: string;
  title: string;
  provider: string | null;
  url: string | null;
  status: (typeof COURSE_STATUS)[number];
  progress: number;
  hours_total: number | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
};

export type Certification = {
  id: string;
  name: string;
  issuer: string | null;
  level: string | null;
  status: (typeof CERT_STATUS)[number];
  exam_date: string | null;
  obtained_at: string | null;
  expires_at: string | null;
  credential_url: string | null;
  notes: string | null;
};

export type Lab = {
  id: string;
  title: string;
  platform: string | null;
  category: string | null;
  difficulty: (typeof LAB_DIFFICULTY)[number];
  status: (typeof LAB_STATUS)[number];
  completed_at: string | null;
  evidence_url: string | null;
  notes: string | null;
};

export type Goal = {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: (typeof GOAL_STATUS)[number];
};

export type StudySession = {
  id: string;
  course_id: string | null;
  studied_on: string;
  minutes: number;
  note: string | null;
};
