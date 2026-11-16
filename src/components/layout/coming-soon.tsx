import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { NAV_ITEMS } from "@/config/nav";

/** Página provisória para módulos das próximas etapas. */
export function ComingSoon({ href, stage }: { href: string; stage: number }) {
  const item = NAV_ITEMS.find((i) => i.href === href)!;
  const Icon = item.icon;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{item.label}</h1>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <Icon className="size-8 text-primary" />
          <Badge variant="accent">Previsto para a Etapa {stage}</Badge>
          <p className="text-sm text-muted-foreground">
            Este módulo ainda não foi implementado.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
