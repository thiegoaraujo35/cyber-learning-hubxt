import { z } from "zod";
import {
  CERT_STATUS,
  COURSE_STATUS,
  GOAL_STATUS,
  LAB_DIFFICULTY,
  LAB_STATUS,
  PATH_STATUS,
  PLATFORM_STATUS,
  RESOURCE_KIND,
} from "@/lib/types";

const text = (label: string, max = 200) =>
  z.string().trim().min(1, `${label} é obrigatório.`).max(max, `${label}: máximo de ${max} caracteres.`);

const optText = (max = 2000) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres.`)
    .transform((v) => (v === "" ? null : v));

const optUrl = z
  .string()
  .trim()
  .max(500, "URL muito longa.")
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v === null || /^https?:\/\//i.test(v), "A URL deve começar com http:// ou https://");

const optDate = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Data inválida.");

const reqDate = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida.");

const optNumber = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v.replace(",", "."))))
    .refine((v) => v === null || (Number.isFinite(v) && v >= min && v <= max), `${label}: valor entre ${min} e ${max}.`);

const reqInt = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= min && v <= max, `${label}: inteiro entre ${min} e ${max}.`);

const optInt = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isInteger(v) && v >= min && v <= max), `${label}: inteiro entre ${min} e ${max}.`);

const optUuid = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .refine((v) => v === null || z.uuid().safeParse(v).success, "Seleção inválida.");

export const courseSchema = z.object({
  title: text("Título"),
  provider: optText(120),
  url: optUrl,
  status: z.enum(COURSE_STATUS),
  progress: reqInt(0, 100, "Progresso"),
  hours_total: optNumber(0, 9999, "Carga horária"),
  platform_id: optUuid,
  total_lessons: optInt(1, 100000, "Total de aulas"),
  completed_lessons: reqInt(0, 100000, "Aulas concluídas"),
  started_at: optDate,
  completed_at: optDate,
  notes: optText(4000),
}).refine((d) => d.total_lessons === null || d.completed_lessons <= d.total_lessons, {
  message: "Aulas concluídas não pode passar do total de aulas.",
  path: ["completed_lessons"],
});

export const certificationSchema = z.object({
  name: text("Nome"),
  issuer: optText(120),
  level: optText(60),
  status: z.enum(CERT_STATUS),
  exam_date: optDate,
  obtained_at: optDate,
  expires_at: optDate,
  credential_url: optUrl,
  notes: optText(4000),
});

export const labSchema = z.object({
  title: text("Título"),
  platform: optText(120),
  category: optText(120),
  difficulty: z.enum(LAB_DIFFICULTY),
  status: z.enum(LAB_STATUS),
  completed_at: optDate,
  evidence_url: optUrl,
  notes: optText(4000),
});

export const goalSchema = z.object({
  title: text("Título"),
  description: optText(2000),
  target_date: optDate,
  status: z.enum(GOAL_STATUS),
});

export const sessionSchema = z.object({
  studied_on: reqDate,
  minutes: reqInt(1, 1440, "Minutos"),
  course_id: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .refine((v) => v === null || z.uuid().safeParse(v).success, "Curso inválido."),
  note: optText(500),
});

export const platformSchema = z.object({
  name: text("Nome", 120),
  url: optUrl,
  account_label: optText(120),
  plan: optText(60),
  status: z.enum(PLATFORM_STATUS),
  notes: optText(2000),
});

export const pathSchema = z.object({
  title: text("Título"),
  description: optText(2000),
  target_date: optDate,
  status: z.enum(PATH_STATUS),
});

export const pathItemSchema = z.object({
  path_id: z.uuid("Trilha inválida."),
  item: z.string().regex(/^(course|certification|lab):[0-9a-fA-F-]{36}$/, "Selecione um item."),
});

export const resourceSchema = z.object({
  title: text("Título"),
  kind: z.enum(RESOURCE_KIND),
  url: optUrl,
  tags: optText(200),
  notes: optText(4000),
});

export const settingsSchema = z.object({
  display_name: optText(80),
  weekly_goal_hours: optNumber(0, 168, "Meta semanal").refine((v) => v !== null, "Informe a meta semanal."),
});

export const passwordSchema = z
  .object({
    new_password: z.string().min(8, "A senha deve ter ao menos 8 caracteres.").max(72, "Senha muito longa."),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "As senhas não conferem.",
    path: ["confirm_password"],
  });
