"use client";

import { CrudModule } from "@/components/crud/crud-module";
import { Loading, ModuleHeader } from "@/components/crud/module-shell";
import type { Field } from "@/components/crud/resource-form";
import { ResourceItem } from "@/components/crud/resource-item";
import { fetchRows, useAsync } from "@/lib/db";
import { platformSchema } from "@/lib/schemas";
import { PLATFORM_STATUS_LABEL, toOptions, type Platform } from "@/lib/types";

const FIELDS: Field[] = [
  { name: "name", label: "Plataforma", type: "text", required: true, wide: true, placeholder: "Ex.: Udemy, TryHackMe, Hack The Box" },
  { name: "url", label: "Site", type: "url", placeholder: "https://…" },
  { name: "plan", label: "Plano", type: "text", placeholder: "Ex.: Individual, Business, Gratuito" },
  { name: "account_label", label: "Conta / usuário (nunca coloque senha)", type: "text", wide: true, placeholder: "Ex.: meu-usuario" },
  { name: "status", label: "Status", type: "select", options: toOptions(PLATFORM_STATUS_LABEL) },
  { name: "notes", label: "Anotações", type: "textarea" },
];

type CourseRef = { platform_id: string | null; status: string };

export default function Page() {
  const { data: courses } = useAsync(() => fetchRows<CourseRef>("courses", "platform_id,status", null));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <ModuleHeader title="Minhas plataformas" description="Plataformas de aprendizagem que você usa." />
      <p className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
        Aqui você só registra onde estuda. O app não guarda senhas nem tokens, e não se conecta sozinho a
        nenhum site: o progresso vem do que você registra nos cursos.
      </p>
      {!courses ? (
        <Loading />
      ) : (
        <CrudModule<Platform, typeof platformSchema>
          table="platforms"
          select="id,name,url,account_label,plan,status,notes"
          fields={FIELDS}
          schema={platformSchema}
          defaults={{ status: "ativa" }}
          newLabel="+ Nova plataforma"
          submitNew="Adicionar plataforma"
          editTitle={(p) => p.name}
          emptyText="Nenhuma plataforma cadastrada ainda. Use “Novo” para começar."
          renderItem={(p, ctx) => {
            const mine = courses.filter((c) => c.platform_id === p.id);
            const done = mine.filter((c) => c.status === "concluido").length;
            return (
              <ResourceItem
                title={p.name}
                subtitle={[p.plan, p.account_label].filter(Boolean).join(" · ") || null}
                badges={[{ label: PLATFORM_STATUS_LABEL[p.status], tone: p.status === "ativa" ? "success" : "muted" }]}
                meta={[`${mine.length} curso(s) · ${done} concluído(s)`]}
                notes={p.notes}
                url={p.url ? { href: p.url, label: "Abrir plataforma" } : null}
                onEdit={ctx.onEdit}
                onDelete={ctx.onDelete}
              />
            );
          }}
        />
      )}
    </div>
  );
}
