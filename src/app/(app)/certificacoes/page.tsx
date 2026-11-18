"use client";

import { CrudModule } from "@/components/crud/crud-module";
import { ModuleHeader } from "@/components/crud/module-shell";
import type { Field } from "@/components/crud/resource-form";
import { ResourceItem } from "@/components/crud/resource-item";
import { formatDate, todayISO } from "@/lib/dates";
import { certificationSchema } from "@/lib/schemas";
import { CERT_STATUS_LABEL, CERT_STATUS_TONE, toOptions, type Certification } from "@/lib/types";

const FIELDS: Field[] = [
  { name: "name", label: "Certificação", type: "text", required: true, wide: true, placeholder: "Ex.: CompTIA Security+" },
  { name: "issuer", label: "Emissor", type: "text", placeholder: "Ex.: CompTIA, ISC2, EC-Council" },
  { name: "level", label: "Nível", type: "text", placeholder: "Ex.: Fundamentos, Profissional" },
  { name: "status", label: "Status", type: "select", options: toOptions(CERT_STATUS_LABEL) },
  { name: "exam_date", label: "Data da prova", type: "date" },
  { name: "obtained_at", label: "Data de obtenção", type: "date" },
  { name: "expires_at", label: "Validade até", type: "date" },
  { name: "credential_url", label: "Link da credencial", type: "url", placeholder: "https://…" },
  { name: "notes", label: "Anotações", type: "textarea" },
];

export default function Page() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <ModuleHeader title="Certificações" description="Catálogo e progresso das certificações." />
      <CrudModule<Certification, typeof certificationSchema>
        table="certifications"
        select="id,name,issuer,level,status,exam_date,obtained_at,expires_at,credential_url,notes"
        fields={FIELDS}
        schema={certificationSchema}
        defaults={{ status: "planejada" }}
        newLabel="+ Nova certificação"
        submitNew="Adicionar certificação"
        editTitle={(c) => c.name}
        emptyText="Nenhuma certificação cadastrada ainda. Use “Novo” para começar."
        prepare={(d) => (d.status === "conquistada" ? { ...d, obtained_at: d.obtained_at ?? todayISO() } : d)}
        renderItem={(c, ctx) => (
          <ResourceItem
            title={c.name}
            subtitle={[c.issuer, c.level].filter(Boolean).join(" · ") || null}
            badges={[{ label: CERT_STATUS_LABEL[c.status], tone: CERT_STATUS_TONE[c.status] }]}
            meta={[
              c.exam_date ? `Prova: ${formatDate(c.exam_date)}` : null,
              c.obtained_at ? `Obtida em: ${formatDate(c.obtained_at)}` : null,
              c.expires_at ? `Válida até: ${formatDate(c.expires_at)}` : null,
            ]}
            notes={c.notes}
            url={c.credential_url ? { href: c.credential_url, label: "Ver credencial" } : null}
            onEdit={ctx.onEdit}
            onDelete={ctx.onDelete}
          />
        )}
      />
    </div>
  );
}
