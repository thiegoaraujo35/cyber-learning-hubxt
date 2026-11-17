import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/proxy";

/**
 * Cliente Supabase do servidor + usuário logado.
 * Retorna null quando o Supabase não está configurado ou não há sessão
 * (ex.: modo visualização) — as telas mostram um aviso em vez de quebrar.
 */
export async function getSession() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { supabase, user };
}
