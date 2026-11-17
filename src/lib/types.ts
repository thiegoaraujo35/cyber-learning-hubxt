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

export const PLATFORM_STATUS = ["ativa", "inativa"] as const;
export const PLATFORM_STATUS_LABEL: Record<(typeof PLATFORM_STATUS)[number], string> = {
  ativa: "Ativa",
  inativa: "Inativa",
};

export const PATH_STATUS = ["ativa", "concluida", "pausada"] as const;
export const PATH_STATUS_LABEL: Record<(typeof PATH_STATUS)[number], string> = {
  ativa: "Ativa",
  concluida: "Concluída",
  pausada: "Pausada",
};
export const PATH_STATUS_TONE: Record<(typeof PATH_STATUS)[number], BadgeTone> = {
  ativa: "default",
  concluida: "success",
  pausada: "warning",
};

export const PATH_ITEM_KIND = ["course", "certification", "lab"] as const;
export const PATH_ITEM_KIND_LABEL: Record<(typeof PATH_ITEM_KIND)[number], string> = {
  course: "Curso",
  certification: "Certificação",
  lab: "Laboratório",
};

export const RESOURCE_KIND = ["documentacao", "artigo", "video", "livro", "ferramenta", "cheatsheet", "outro"] as const;
export const RESOURCE_KIND_LABEL: Record<(typeof RESOURCE_KIND)[number], string> = {
  documentacao: "Documentação",
  artigo: "Artigo",
  video: "Vídeo",
  livro: "Livro",
  ferramenta: "Ferramenta",
  cheatsheet: "Cheat sheet",
  outro: "Outro",
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
  platform_id: string | null;
  total_lessons: number | null;
  completed_lessons: number;
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

export type Platform = {
  id: string;
  name: string;
  url: string | null;
  account_label: string | null;
  plan: string | null;
  status: (typeof PLATFORM_STATUS)[number];
  notes: string | null;
};

export type LearningPath = {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  status: (typeof PATH_STATUS)[number];
};

export type PathItem = {
  id: string;
  path_id: string;
  kind: (typeof PATH_ITEM_KIND)[number];
  ref_id: string;
};

export type Resource = {
  id: string;
  title: string;
  kind: (typeof RESOURCE_KIND)[number];
  url: string | null;
  tags: string | null;
  notes: string | null;
};
