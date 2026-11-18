"use client";

import { useState } from "react";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CrudModule } from "@/components/crud/crud-module";
import { Loading, LoadError, ModuleHeader } from "@/components/crud/module-shell";
import { ResourceForm, type Field } from "@/components/crud/resource-form";
import { ResourceItem } from "@/components/crud/resource-item";
import { fetchRows, insertRow, updateRow, useAsync } from "@/lib/db";
import { formatDate, todayISO } from "@/lib/dates";
import { lessonState } from "@/lib/progress";
import { courseSchema } from "@/lib/schemas";
import { COURSE_STATUS_LABEL, COURSE_STATUS_TONE, toOptions, type Course } from "@/lib/types";

type PlatformRef = { id: string; name: string };

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

async function importLinks(data: z.output<typeof importSchema>): Promise<{ error?: string; message?: string }> {
  const urls = new Map<string, URL>();
  for (const line of data.links.split(/\r?\n/)) {
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

  const existing = await fetchRows<{ url: string | null }>("courses", "url", null);
  const known = new Set(existing.map((r) => r.url).filter(Boolean));
  const rows = [...urls.entries()]
    .filter(([href]) => !known.has(href))
    .map(([href, u]) => ({
      title: titleFromUrl(u),
      url: href,
      platform_id: data.platform_id,
      status: "planejado",
    }));
  if (rows.length === 0) return { error: "Todos esses links já estão cadastrados." };

  const err = await insertRow("courses", rows);
  if (err) return { error: err };
  return { message: `${rows.length} curso(s) importado(s).` };
}

/** Botão "+1 aula": soma uma aula concluída e recalcula progresso e status. */
async function addLesson(c: Course) {
  if (!c.total_lessons) return;
  const state = lessonState(c.total_lessons, c.completed_lessons + 1, c.status)!;
  await updateRow("courses", c.id, {
    ...state,
    completed_at: state.status === "concluido" ? (c.completed_at ?? todayISO()) : c.completed_at,
  });
}

export default function Page() {
  const { data: platforms, error } = useAsync(() =>
    fetchRows<PlatformRef>("platforms", "id,name", { column: "name", ascending: true }),
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <ModuleHeader title="Meus cursos" description="Todos os seus cursos em um só lugar." />
      {error ? <LoadError detail={error} /> : !platforms ? <Loading /> : <Courses platforms={platforms} />}
    </div>
  );
}

function Courses({ platforms }: { platforms: PlatformRef[] }) {
  const platformName = new Map(platforms.map((p) => [p.id, p.name]));
  const platformOptions = [
    { value: "", label: "Sem plataforma cadastrada" },
    ...platforms.map((p) => ({ value: p.id, label: p.name })),
  ];

  const fields: Field[] = [
    { name: "title", label: "Título", type: "text", required: true, wide: true, placeholder: "Ex.: Security+ SY0-701" },
    { name: "platform_id", label: "Plataforma", type: "select", options: platformOptions },
    { name: "provider", label: "Instrutor / observação da origem", type: "text", placeholder: "Ex.: Prof. Fulano" },
    { name: "url", label: "Link do curso", type: "url", wide: true, placeholder: "https://…" },
    { name: "status", label: "Status", type: "select", options: toOptions(COURSE_STATUS_LABEL) },
    { name: "hours_total", label: "Carga horária (h)", type: "number", min: 0, step: 0.5 },
    { name: "total_lessons", label: "Total de aulas (calcula o progresso)", type: "number", min: 1, step: 1 },
    { name: "completed_lessons", label: "Aulas concluídas", type: "number", min: 0, step: 1, required: true },
    { name: "progress", label: "Progresso (%) — usado se não houver total de aulas", type: "number", min: 0, max: 100, step: 1, required: true },
    { name: "started_at", label: "Início", type: "date" },
    { name: "completed_at", label: "Conclusão", type: "date" },
    { name: "notes", label: "Anotações", type: "textarea" },
  ];

  const importFields: Field[] = [
    { name: "platform_id", label: "Plataforma dos cursos", type: "select", wide: true, options: platformOptions },
    {
      name: "links",
      label: "Links dos cursos (um por linha)",
      type: "textarea",
      placeholder: "https://www.udemy.com/course/…\nhttps://www.udemy.com/course/…",
    },
  ];

  return (
    <CrudModule<Course, typeof courseSchema>
      table="courses"
      select="id,title,provider,url,status,progress,hours_total,platform_id,total_lessons,completed_lessons,started_at,completed_at,notes"
      fields={fields}
      schema={courseSchema}
      defaults={{ progress: 0, completed_lessons: 0, status: "planejado" }}
      newLabel="+ Novo curso"
      submitNew="Adicionar curso"
      editTitle={(c) => c.title}
      emptyText="Nenhum curso cadastrado ainda. Use “Novo” para começar."
      prepare={(d) => {
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
      }}
      afterForm={(reload) => <ImportCard fields={importFields} onImported={reload} />}
      renderItem={(c, ctx) => (
        <ResourceItem
          title={c.title}
          subtitle={[c.platform_id ? platformName.get(c.platform_id) : null, c.provider].filter(Boolean).join(" · ") || null}
          badges={[{ label: COURSE_STATUS_LABEL[c.status], tone: COURSE_STATUS_TONE[c.status] }]}
          progress={c.progress}
          meta={[
            c.total_lessons ? `${c.completed_lessons} de ${c.total_lessons} aulas` : null,
            c.hours_total ? `${c.hours_total} h de carga horária` : null,
            c.started_at ? `Início: ${formatDate(c.started_at)}` : null,
            c.completed_at ? `Concluído em: ${formatDate(c.completed_at)}` : null,
          ]}
          notes={c.notes}
          url={c.url ? { href: c.url, label: "Abrir curso" } : null}
          onEdit={ctx.onEdit}
          onDelete={ctx.onDelete}
          extra={
            c.total_lessons && c.status !== "concluido" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="self-start"
                onClick={async () => {
                  await addLesson(c);
                  ctx.reload();
                }}
              >
                <Plus /> 1 aula concluída
              </Button>
            ) : null
          }
        />
      )}
    />
  );
}

function ImportCard({ fields, onImported }: { fields: Field[]; onImported: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Importar vários cursos por link</p>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen((v) => !v)}>
          {open ? "Fechar" : "Abrir"}
        </Button>
      </div>
      {open && (
        <>
          <p className="mt-3 text-xs text-muted-foreground">
            Cole os links dos cursos (por exemplo, de uma trilha da Udemy). O título é montado a partir do
            link e você pode ajustar depois. Links já cadastrados são ignorados.
          </p>
          <div className="mt-4">
            <ResourceForm
              fields={fields}
              schema={importSchema}
              submitLabel="Importar cursos"
              resetOnSuccess
              onSave={async (data) => {
                const result = await importLinks(data);
                if (!result.error) onImported();
                return result;
              }}
            />
          </div>
        </>
      )}
    </Card>
  );
}
