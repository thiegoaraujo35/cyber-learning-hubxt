"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrudModule } from "@/components/crud/crud-module";
import { Loading, LoadError, ModuleHeader } from "@/components/crud/module-shell";
import type { Field } from "@/components/crud/resource-form";
import { ResourceItem } from "@/components/crud/resource-item";
import { useAsync } from "@/lib/db";
import { formatDate } from "@/lib/dates";
import { loadPathData, pathProgress } from "@/lib/paths";
import { pathSchema } from "@/lib/schemas";
import { getSupabase } from "@/lib/supabase/client";
import { PATH_STATUS_LABEL, PATH_STATUS_TONE, toOptions, type LearningPath } from "@/lib/types";

const FIELDS: Field[] = [
  { name: "title", label: "Nome da trilha", type: "text", required: true, wide: true, placeholder: "Ex.: Pentest do zero ao OSCP" },
  { name: "target_date", label: "Prazo", type: "date" },
  { name: "status", label: "Status", type: "select", options: toOptions(PATH_STATUS_LABEL) },
  { name: "description", label: "Descrição", type: "textarea" },
];

export default function Page() {
  const { data, error } = useAsync(() => loadPathData(getSupabase()));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <ModuleHeader title="Learning Paths" description="Trilhas de aprendizagem personalizadas." />
      {error ? (
        <LoadError detail={error} />
      ) : !data ? (
        <Loading />
      ) : (
        <CrudModule<LearningPath, typeof pathSchema>
          table="learning_paths"
          select="id,title,description,target_date,status"
          fields={FIELDS}
          schema={pathSchema}
          defaults={{ status: "ativa" }}
          newLabel="+ Nova trilha"
          submitNew="Criar trilha"
          editTitle={(p) => p.title}
          emptyText="Nenhuma trilha criada ainda. Crie uma trilha e depois adicione cursos, certificações e laboratórios a ela."
          renderItem={(p, ctx) => {
            const prog = pathProgress(data.items.filter((i) => i.path_id === p.id));
            return (
              <ResourceItem
                title={p.title}
                badges={[{ label: PATH_STATUS_LABEL[p.status], tone: PATH_STATUS_TONE[p.status] }]}
                progress={prog.percent}
                meta={[
                  `${prog.done} de ${prog.total} itens concluídos`,
                  p.target_date ? `Prazo: ${formatDate(p.target_date)}` : null,
                ]}
                notes={p.description}
                onEdit={ctx.onEdit}
                onDelete={ctx.onDelete}
                extra={
                  <Button asChild size="sm" variant="outline" className="self-start">
                    <Link href={`/learning-paths/trilha?id=${p.id}`}>
                      Abrir trilha <ArrowRight />
                    </Link>
                  </Button>
                }
              />
            );
          }}
        />
      )}
    </div>
  );
}
