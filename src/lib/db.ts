"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

export const SAVE_ERROR = "Não foi possível salvar. Tente novamente.";

/** Busca linhas de uma tabela (RLS já limita ao usuário logado). */
export async function fetchRows<T>(
  table: string,
  select: string,
  order: { column: string; ascending?: boolean } | null = { column: "created_at", ascending: false },
): Promise<T[]> {
  let query = getSupabase().from(table).select(select);
  if (order) query = query.order(order.column, { ascending: order.ascending ?? false });
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as T[];
}

/** Retorna a mensagem de erro (ou null se deu certo). O user_id vem do default auth.uid() do banco. */
export async function insertRow(table: string, payload: unknown): Promise<string | null> {
  const { error } = await getSupabase().from(table).insert(payload as never);
  return error ? SAVE_ERROR : null;
}

export async function updateRow(table: string, id: string, payload: unknown): Promise<string | null> {
  const { error } = await getSupabase().from(table).update(payload as never).eq("id", id);
  return error ? SAVE_ERROR : null;
}

export async function removeRow(table: string, id: string): Promise<string | null> {
  const { error } = await getSupabase().from(table).delete().eq("id", id);
  return error ? "Não foi possível excluir. Tente novamente." : null;
}

/** Carrega dados assíncronos ao montar o componente; `reload()` busca de novo. */
export function useAsync<T>(fn: () => Promise<T>) {
  const [state, setState] = useState<{ data: T | null; error: string | null }>({
    data: null,
    error: null,
  });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    let cancelled = false;
    fnRef.current()
      .then((data) => {
        if (!cancelled) setState({ data, error: null });
      })
      .catch((e: unknown) => {
        if (!cancelled) setState({ data: null, error: e instanceof Error ? e.message : "Erro ao carregar." });
      });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data: state.data, error: state.error, loading: state.data === null && state.error === null, reload };
}
