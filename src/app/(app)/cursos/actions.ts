"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { removeRow, saveRow, type FormState } from "@/lib/crud";
import { getSession } from "@/lib/data";
import { todayISO } from "@/lib/dates";
import { lessonState } from "@/lib/progress";
import { courseSchema } from "@/lib/schemas";
import type { Course } from "@/lib/types";

export async function saveCourse(_: FormState, formData: FormData): Promise<FormState> {
  return saveRow({
    table: "courses",
    schema: courseSchema,
    formData,
    path: "/cursos",
    prepare: (d) => {
      let next = { ...d };
      // Com total de aulas informado, o progresso é calculado a partir das aulas concluídas.
      if (d.status !== "concluido" && d.total_lessons) {
        next = { ...next, ...lessonState(d.total_lessons, d.completed_lessons, d.status)! };
      }
      // Curso concluído = 100% (e todas as aulas), com data de conclusão (hoje, se não informada).
      if (next.status === "concluido") {
        next = {
          ...next,
          progress: 100,
          completed_lessons: next.total_lessons ?? next.completed_lessons,
          completed_at: next.completed_at ?? todayISO(),
        };
      }
      return next;
    },
  });
}

export async function deleteCourse(formData: FormData) {
  await removeRow("courses", formData, "/cursos");
}

/** Botão "+1 aula": soma uma aula concluída e recalcula progresso e status. */
export async function addLesson(formData: FormData) {
  const session = await getSession();
  const id = formData.get("id");
  if (!session || typeof id !== "string" || !z.uuid().safeParse(id).success) return;

  const { data } = await session.supabase
    .from("courses")
    .select("status,total_lessons,completed_lessons,completed_at")
    .eq("id", id)
    .single();
  const c = data as Pick<Course, "status" | "total_lessons" | "completed_lessons" | "completed_at"> | null;
  if (!c || !c.total_lessons) return;

  const state = lessonState(c.total_lessons, c.completed_lessons + 1, c.status)!;
  await session.supabase
    .from("courses")
    .update({
      ...state,
      completed_at: state.status === "concluido" ? (c.completed_at ?? todayISO()) : c.completed_at,
    })
    .eq("id", id);

  revalidatePath("/cursos");
  revalidatePath("/dashboard");
}

const importSchema = z.object({
  platform_id: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .refine((v) => v === null || z.uuid().safeParse(v).success, "Plataforma inválida."),
  links: z.string().trim().min(1, "Cole ao menos um link."),
});

/** "https://www.udemy.com/course/curso-de-nmap/" → "Curso De Nmap" (título editável depois). */
function titleFromUrl(url: URL): string {
  const parts = url.pathname.split("/").filter(Boolean);
  const slug = decodeURIComponent(parts[parts.length - 1] ?? url.hostname).replace(/\.[a-z0-9]{2,5}$/i, "");
  const words = slug.replace(/[-_]+/g, " ").trim();
  const title = words.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
  return (title || url.hostname).slice(0, 200);
}

/** Importação em lote: um link por linha. Evita duplicar links que já existem. */
export async function importCourses(_: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: "Entre com sua conta para importar cursos." };

  const parsed = importSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const urls = new Map<string, URL>();
  for (const line of parsed.data.links.split(/\r?\n/)) {
    const raw = line.trim();
    if (!raw) continue;
    let u: URL;
    try {
      u = new URL(raw);
    } catch {
      return { error: `Link inválido: ${raw.slice(0, 80)}` };
    }
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return { error: `Só links http(s) são aceitos: ${raw.slice(0, 80)}` };
    }
    urls.set(u.toString(), u);
  }
  if (urls.size === 0) return { error: "Cole ao menos um link." };
  if (urls.size > 50) return { error: "Importe no máximo 50 links por vez." };

  const { data: existing, error: readError } = await session.supabase.from("courses").select("url");
  if (readError) return { error: "Não foi possível importar. Tente novamente." };
  const known = new Set((existing ?? []).map((r) => r.url).filter(Boolean));

  const rows = [...urls.entries()]
    .filter(([href]) => !known.has(href))
    .map(([href, u]) => ({
      title: titleFromUrl(u),
      url: href,
      platform_id: parsed.data.platform_id,
      status: "planejado",
    }));

  if (rows.length === 0) return { error: "Todos esses links já estão cadastrados." };

  const { error } = await session.supabase.from("courses").insert(rows);
  if (error) return { error: "Não foi possível importar. Tente novamente." };

  revalidatePath("/cursos");
  revalidatePath("/dashboard");
  redirect("/cursos");
}
