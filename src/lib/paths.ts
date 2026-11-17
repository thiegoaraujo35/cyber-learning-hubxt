import type { SupabaseClient } from "@supabase/supabase-js";
import type { PathItem } from "@/lib/types";
import { PATH_ITEM_KIND_LABEL } from "@/lib/types";

export type ResolvedItem = {
  id: string;
  path_id: string;
  kind: PathItem["kind"];
  ref_id: string;
  title: string;
  done: boolean;
  href: string;
};

export type Candidate = { value: string; label: string };

/**
 * Resolve os itens das trilhas (cursos, certificações, laboratórios) para título e estado.
 * Itens cujo alvo foi excluído somem da trilha (o título não existe mais).
 * Também devolve todos os itens possíveis (para o seletor "adicionar à trilha").
 */
export async function loadPathData(supabase: SupabaseClient) {
  const [items, courses, certs, labs] = await Promise.all([
    supabase.from("path_items").select("id,path_id,kind,ref_id").order("created_at"),
    supabase.from("courses").select("id,title,status").order("title"),
    supabase.from("certifications").select("id,name,status").order("name"),
    supabase.from("labs").select("id,title,status").order("title"),
  ]);

  if (items.error || courses.error || certs.error || labs.error) return null;

  const lookup = new Map<string, { title: string; done: boolean; href: string }>();
  const candidates: Candidate[] = [];

  for (const c of courses.data ?? []) {
    lookup.set(`course:${c.id}`, { title: c.title, done: c.status === "concluido", href: `/cursos?edit=${c.id}` });
    candidates.push({ value: `course:${c.id}`, label: `${PATH_ITEM_KIND_LABEL.course} · ${c.title}` });
  }
  for (const c of certs.data ?? []) {
    lookup.set(`certification:${c.id}`, { title: c.name, done: c.status === "conquistada", href: `/certificacoes?edit=${c.id}` });
    candidates.push({ value: `certification:${c.id}`, label: `${PATH_ITEM_KIND_LABEL.certification} · ${c.name}` });
  }
  for (const l of labs.data ?? []) {
    lookup.set(`lab:${l.id}`, { title: l.title, done: l.status === "concluido", href: `/laboratorios?edit=${l.id}` });
    candidates.push({ value: `lab:${l.id}`, label: `${PATH_ITEM_KIND_LABEL.lab} · ${l.title}` });
  }

  const resolved: ResolvedItem[] = [];
  for (const it of (items.data ?? []) as PathItem[]) {
    const hit = lookup.get(`${it.kind}:${it.ref_id}`);
    if (hit) resolved.push({ ...it, ...hit });
  }

  return { items: resolved, candidates };
}

export function pathProgress(items: ResolvedItem[]) {
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
