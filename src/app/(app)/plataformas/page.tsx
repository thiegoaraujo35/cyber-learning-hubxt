import { Suspense } from "react";
import { ModuleHeader, EmptyState, LoadError, NeedsLogin } from "@/components/crud/module-shell";
import { ResourceForm, type Field } from "@/components/crud/resource-form";
import { ResourceItem } from "@/components/crud/resource-item";
import { getSession } from "@/lib/data";
import { PLATFORM_STATUS_LABEL, toOptions, type Platform } from "@/lib/types";
import { deletePlatform, savePlatform } from "./actions";

export const metadata = { title: "Minhas plataformas — Cyber Learning Hub" };

const FIELDS: Field[] = [
  { name: "name", label: "Plataforma", type: "text", required: true, wide: true, placeholder: "Ex.: Udemy, TryHackMe, Hack The Box" },
  { name: "url", label: "Site", type: "url", placeholder: "https://…" },
  { name: "plan", label: "Plano", type: "text", placeholder: "Ex.: Individual, Business, Gratuito" },
  { name: "account_label", label: "Conta / usuário (nunca coloque senha)", type: "text", wide: true, placeholder: "Ex.: meu-usuario" },
  { name: "status", label: "Status", type: "select", options: toOptions(PLATFORM_STATUS_LABEL) },
  { name: "notes", label: "Anotações", type: "textarea" },
];

export default function Page({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <ModuleHeader title="Minhas plataformas" description="Plataformas de aprendizagem que você usa." />
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

  const [platformsRes, coursesRes] = await Promise.all([
    session.supabase
      .from("platforms")
      .select("id,name,url,account_label,plan,status,notes")
      .order("name"),
    session.supabase.from("courses").select("platform_id,status"),
  ]);
  if (platformsRes.error || coursesRes.error) return <LoadError />;

  const platforms = (platformsRes.data ?? []) as Platform[];
  const editing = platforms.find((p) => p.id === edit);
  const courses = coursesRes.data ?? [];

  return (
    <>
      <p className="rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground">
        Aqui você só registra onde estuda. A plataforma não guarda senhas nem tokens, e não se conecta
        sozinha a nenhum site: o progresso vem do que você registra nos cursos.
      </p>

      <details open={Boolean(editing)} className="rounded-2xl border border-border bg-card p-5">
        <summary className="cursor-pointer text-sm font-semibold">
          {editing ? `Editando: ${editing.name}` : "+ Nova plataforma"}
        </summary>
        <div className="mt-4">
          <ResourceForm
            key={editing?.id ?? "nova"}
            fields={FIELDS}
            action={savePlatform}
            values={editing ?? { status: "ativa" }}
            submitLabel={editing ? "Salvar alterações" : "Adicionar plataforma"}
            cancelHref={editing ? "/plataformas" : undefined}
          />
        </div>
      </details>

      {platforms.length === 0 ? (
        <EmptyState>Nenhuma plataforma cadastrada ainda. Use “+ Nova plataforma” para começar.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {platforms.map((p) => {
            const mine = courses.filter((c) => c.platform_id === p.id);
            const done = mine.filter((c) => c.status === "concluido").length;
            return (
              <ResourceItem
                key={p.id}
                id={p.id}
                title={p.name}
                subtitle={[p.plan, p.account_label].filter(Boolean).join(" · ") || null}
                badges={[{ label: PLATFORM_STATUS_LABEL[p.status], tone: p.status === "ativa" ? "success" : "muted" }]}
                meta={[`${mine.length} curso(s) · ${done} concluído(s)`]}
                notes={p.notes}
                url={p.url ? { href: p.url, label: "Abrir plataforma" } : null}
                editHref={`/plataformas?edit=${p.id}`}
                deleteAction={deletePlatform}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
