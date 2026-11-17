import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { getSession } from "@/lib/data";

export type FormState = { error?: string };

const NEEDS_LOGIN =
  "Entre com sua conta para salvar dados (o modo visualização e o app sem Supabase não gravam nada).";

/**
 * Cria ou atualiza uma linha. O user_id vem do default `auth.uid()` do banco e a RLS
 * garante que ninguém grave ou altere dados de outra pessoa.
 * Em caso de sucesso, revalida e redireciona para a lista (limpa o `?edit=`).
 */
export async function saveRow<S extends z.ZodType>(opts: {
  table: string;
  schema: S;
  formData: FormData;
  path: string;
  prepare?: (data: z.output<S>) => Record<string, unknown>;
}): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: NEEDS_LOGIN };

  const raw = Object.fromEntries(opts.formData);
  const parsed = opts.schema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const payload = opts.prepare ? opts.prepare(parsed.data) : (parsed.data as Record<string, unknown>);

  const id = typeof raw.id === "string" ? raw.id : "";
  const query = session.supabase.from(opts.table);
  const { error } = id
    ? await query.update(payload).eq("id", id)
    : await query.insert(payload);

  if (error) return { error: "Não foi possível salvar. Tente novamente." };

  revalidatePath(opts.path);
  revalidatePath("/dashboard");
  redirect(opts.path);
}

export async function removeRow(table: string, formData: FormData, path: string) {
  const session = await getSession();
  if (!session) return;
  const id = formData.get("id");
  if (typeof id !== "string" || id === "") return;
  await session.supabase.from(table).delete().eq("id", id);
  revalidatePath(path);
  revalidatePath("/dashboard");
}
