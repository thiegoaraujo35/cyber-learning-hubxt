import { Card, CardContent } from "@/components/ui/card";

export function ModuleHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-10 text-center text-sm text-muted-foreground">{children}</CardContent>
    </Card>
  );
}

export function Loading() {
  return <p className="text-sm text-muted-foreground">Carregando…</p>;
}

export function LoadError({ detail }: { detail?: string | null }) {
  return (
    <div role="alert" className="rounded-xl border border-destructive/40 bg-card p-4 text-sm text-destructive">
      <p>
        Não foi possível carregar os dados. Confira se as migrations foram aplicadas no Supabase
        (pasta <code>supabase/migrations</code>) e tente recarregar a página.
      </p>
      {detail && <p className="mt-2 break-words text-xs text-muted-foreground">Detalhe: {detail}</p>}
    </div>
  );
}
