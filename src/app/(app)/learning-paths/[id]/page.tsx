import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Check, Circle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteButton } from "@/components/crud/delete-button";
import { LoadError, NeedsLogin } from "@/components/crud/module-shell";
import { ResourceForm, type Field } from "@/components/crud/resource-form";
import { getSession } from "@/lib/data";
import { formatDate } from "@/lib/dates";
import { loadPathData, pathProgress } from "@/lib/paths";
import {
  PATH_ITEM_KIND_LABEL,
  PATH_STATUS_LABEL,
  PATH_STATUS_TONE,
  type LearningPath,
} from "@/lib/types";
import { z } from "zod";
import { addPathItem, removePathItem } from "../actions";

export const metadata = { title: "Trilha — Cyber Learning Hub" };

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link href="/learning-paths" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Todas as trilhas
      </Link>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}>
        <Content params={params} />
      </Suspense>
    </div>
  );
}

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();

  const session = await getSession();
  if (!session) return <NeedsLogin />;

  const [pathRes, data] = await Promise.all([
    session.supabase
      .from("learning_paths")
      .select("id,title,description,target_date,status")
      .eq("id", id)
      .maybeSingle(),
    loadPathData(session.supabase),
  ]);
  if (pathRes.error || !data) return <LoadError />;
  if (!pathRes.data) notFound();

  const path = pathRes.data as LearningPath;
  const items = data.items.filter((i) => i.path_id === id);
  const prog = pathProgress(items);
  const used = new Set(items.map((i) => `${i.kind}:${i.ref_id}`));
  const available = data.candidates.filter((c) => !used.has(c.value));

  const fields: Field[] = [
    {
      name: "item",
      label: "Adicionar à trilha",
      type: "select",
      wide: true,
      options: available.length > 0 ? available : [{ value: "", label: "Nada disponível — cadastre cursos, certificações ou laboratórios" }],
    },
  ];

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{path.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge variant={PATH_STATUS_TONE[path.status]}>{PATH_STATUS_LABEL[path.status]}</Badge>
          {path.target_date && (
            <span className="text-xs text-muted-foreground">Prazo: {formatDate(path.target_date)}</span>
          )}
        </div>
        {path.description && (
          <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{path.description}</p>
        )}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#ff8a3d] to-[#ff4d6d]"
            style={{ width: `${prog.percent}%` }}
          />
        </div>
        <p className="mt-1 text-xs tabular-nums text-muted-foreground">
          {prog.done} de {prog.total} itens · {prog.percent}%
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Itens da trilha</CardTitle>
          <CardDescription>
            O item conta como concluído quando o curso/laboratório está concluído ou a certificação
            está conquistada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum item na trilha ainda.</p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((it) => (
                <li key={it.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {it.done ? (
                      <Check className="size-4 shrink-0 text-emerald-400" aria-label="Concluído" />
                    ) : (
                      <Circle className="size-4 shrink-0 text-muted-foreground" aria-label="Pendente" />
                    )}
                    <div className="min-w-0">
                      <p className={it.done ? "truncate text-sm text-muted-foreground line-through" : "truncate text-sm"}>
                        {it.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{PATH_ITEM_KIND_LABEL[it.kind]}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center">
                    <Link href={it.href} aria-label="Abrir item" className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <ExternalLink className="size-4" />
                    </Link>
                    <DeleteButton id={it.id} action={removePathItem} confirmText="Remover este item da trilha? (o curso/certificação/laboratório continua cadastrado)" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <ResourceFormWithPath fields={fields} pathId={id} disabled={available.length === 0} />
        </CardContent>
      </Card>
    </>
  );
}

/** Formulário de adicionar item: injeta o path_id como campo oculto. */
function ResourceFormWithPath({ fields, pathId, disabled }: { fields: Field[]; pathId: string; disabled: boolean }) {
  if (disabled) {
    return (
      <p className="text-sm text-muted-foreground">
        Todos os seus cursos, certificações e laboratórios já estão nesta trilha (ou ainda não há
        nenhum cadastrado).
      </p>
    );
  }
  return (
    <ResourceForm fields={fields} action={addPathItem} submitLabel="Adicionar" hiddenFields={{ path_id: pathId }} />
  );
}
