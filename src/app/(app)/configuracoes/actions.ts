"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/lib/crud";
import { getSession } from "@/lib/data";
import { passwordSchema, settingsSchema } from "@/lib/schemas";

const NEEDS_LOGIN = "Entre com sua conta para alterar as configurações.";

export async function saveSettings(_: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: NEEDS_LOGIN };

  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await session.supabase
    .from("user_settings")
    .upsert({ user_id: session.user.id, ...parsed.data }, { onConflict: "user_id" });
  if (error) return { error: "Não foi possível salvar. Tente novamente." };

  revalidatePath("/configuracoes");
  revalidatePath("/dashboard");
  return { message: "Configurações salvas." };
}

export async function changePassword(_: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: NEEDS_LOGIN };

  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await session.supabase.auth.updateUser({ password: parsed.data.new_password });
  if (error) return { error: "Não foi possível alterar a senha. Tente novamente." };
  return { message: "Senha alterada." };
}
