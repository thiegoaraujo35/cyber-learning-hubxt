import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ModuleHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function NeedsLogin() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
      <Info className="mt-0.5 size-4 shrink-0 text-primary" />
      <p>
        Entre com sua conta para ver e cadastrar dados. No modo visualização (ou sem Supabase
        configurado) nada é lido nem gravado.
      </p>
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

export function LoadError() {
  return (
    <div role="alert" className="rounded-xl border border-destructive/40 bg-card p-4 text-sm text-destructive">
      Não foi possível carregar os dados. Confira se a migration da Etapa 2 foi aplicada
      (<code>npx supabase db reset</code>).
    </div>
  );
}
