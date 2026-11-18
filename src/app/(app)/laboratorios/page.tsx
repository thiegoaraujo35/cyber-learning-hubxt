"use client";

import { CrudModule } from "@/components/crud/crud-module";
import { ModuleHeader } from "@/components/crud/module-shell";
import type { Field } from "@/components/crud/resource-form";
import { ResourceItem } from "@/components/crud/resource-item";
import { formatDate, todayISO } from "@/lib/dates";
import { labSchema } from "@/lib/schemas";
import { LAB_DIFFICULTY_LABEL, LAB_STATUS_LABEL, LAB_STATUS_TONE, toOptions, type Lab } from "@/lib/types";

const FIELDS: Field[] = [
  { name: "title", label: "Laboratório / sala / máquina", type: "text", required: true, wide: true, placeholder: "Ex.: Blue (TryHackMe)" },
  { name: "platform", label: "Plataforma", type: "text", placeholder: "Ex.: TryHackMe, Hack The Box" },
  { name: "category", label: "Categoria", type: "text", placeholder: "Ex.: Web, Active Directory, Forense" },
  { name: "difficulty", label: "Dificuldade", type: "select", options: toOptions(LAB_DIFFICULTY_LABEL) },
  { name: "status", label: "Status", type: "select", options: toOptions(LAB_STATUS_LABEL) },
  { name: "completed_at", label: "Concluído em", type: "date" },
  { name: "evidence_url", label: "Link da evidência / write-up", type: "url", placeholder: "https://…" },
  { name: "notes", label: "Anotações", type: "textarea" },
];

export default function Page() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <ModuleHeader title="Laboratórios" description="Prática em laboratórios e evidências." />
      <CrudModule<Lab, typeof labSchema>
        table="labs"
        select="id,title,platform,category,difficulty,status,completed_at,evidence_url,notes"
        fields={FIELDS}
        schema={labSchema}
        defaults={{ status: "pendente", difficulty: "iniciante" }}
        newLabel="+ Novo laboratório"
        submitNew="Adicionar laboratório"
        editTitle={(l) => l.title}
        emptyText="Nenhum laboratório registrado ainda. Use “Novo” para começar."
        prepare={(d) => (d.status === "concluido" ? { ...d, completed_at: d.completed_at ?? todayISO() } : d)}
        renderItem={(l, ctx) => (
          <ResourceItem
            title={l.title}
            subtitle={[l.platform, l.category].filter(Boolean).join(" · ") || null}
            badges={[
              { label: LAB_STATUS_LABEL[l.status], tone: LAB_STATUS_TONE[l.status] },
              { label: LAB_DIFFICULTY_LABEL[l.difficulty], tone: "muted" },
            ]}
            meta={[l.completed_at ? `Concluído em: ${formatDate(l.completed_at)}` : null]}
            notes={l.notes}
            url={l.evidence_url ? { href: l.evidence_url, label: "Ver evidência" } : null}
            onEdit={ctx.onEdit}
            onDelete={ctx.onDelete}
          />
        )}
      />
    </div>
  );
}
