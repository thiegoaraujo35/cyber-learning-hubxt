import { Suspense } from "react";
import { ModuleHeader, EmptyState, LoadError, NeedsLogin } from "@/components/crud/module-shell";
import { ResourceForm, type Field } from "@/components/crud/resource-form";
import { ResourceItem } from "@/components/crud/resource-item";
import { getSession } from "@/lib/data";
import { formatDate } from "@/lib/dates";
import {
  CERT_STATUS_LABEL,
  CERT_STATUS_TONE,
  toOptions,
  type Certification,
} from "@/lib/types";
import { deleteCertification, saveCertification } from "./actions";

export const metadata = { title: "Certificações — Cyber Learning Hub" };

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

export default function Page({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <ModuleHeader title="Certificações" description="Catálogo e progresso das certificações." />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}>
        <Content searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Content({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const session = await getSession();
  if (!session) return <NeedsLogin />;

  const { data, error } = await session.supabase
    .from("certifications")
    .select("id,name,issuer,level,status,exam_date,obtained_at,expires_at,credential_url,notes")
    .order("created_at", { ascending: false });
  if (error) return <LoadError />;

  const certs = (data ?? []) as Certification[];
  const editing = certs.find((c) => c.id === edit);

  return (
    <>
      <details open={Boolean(editing)} className="rounded-2xl border border-border bg-card p-5">
        <summary className="cursor-pointer text-sm font-semibold">
          {editing ? `Editando: ${editing.name}` : "+ Nova certificação"}
        </summary>
        <div className="mt-4">
          <ResourceForm
            key={editing?.id ?? "nova"}
            fields={FIELDS}
            action={saveCertification}
            values={editing ?? { status: "planejada" }}
            submitLabel={editing ? "Salvar alterações" : "Adicionar certificação"}
            cancelHref={editing ? "/certificacoes" : undefined}
          />
        </div>
      </details>

      {certs.length === 0 ? (
        <EmptyState>Nenhuma certificação cadastrada ainda. Use “+ Nova certificação” para começar.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certs.map((c) => (
            <ResourceItem
              key={c.id}
              id={c.id}
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
              editHref={`/certificacoes?edit=${c.id}`}
              deleteAction={deleteCertification}
            />
          ))}
        </div>
      )}
    </>
  );
}
