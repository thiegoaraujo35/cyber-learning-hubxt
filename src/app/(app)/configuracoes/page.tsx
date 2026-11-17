import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadError, ModuleHeader, NeedsLogin } from "@/components/crud/module-shell";
import { ResourceForm, type Field } from "@/components/crud/resource-form";
import { getSession } from "@/lib/data";
import { changePassword, saveSettings } from "./actions";

export const metadata = { title: "Configurações — Cyber Learning Hub" };

const SETTINGS_FIELDS: Field[] = [
  { name: "display_name", label: "Nome de exibição", type: "text", placeholder: "Como você quer ser chamado" },
  { name: "weekly_goal_hours", label: "Meta semanal de estudo (horas)", type: "number", min: 0, max: 168, step: 0.5, required: true },
];

const PASSWORD_FIELDS: Field[] = [
  { name: "new_password", label: "Nova senha (mín. 8 caracteres)", type: "password", required: true },
  { name: "confirm_password", label: "Confirmar nova senha", type: "password", required: true },
];

export default function Page() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <ModuleHeader title="Configurações" description="Preferências da conta e do sistema." />
      <Suspense fallback={<p className="text-sm text-muted-foreground">Carregando…</p>}>
        <Content />
      </Suspense>
    </div>
  );
}

async function Content() {
  const session = await getSession();
  if (!session) return <NeedsLogin />;

  const { data, error } = await session.supabase
    .from("user_settings")
    .select("display_name,weekly_goal_hours")
    .maybeSingle();
  if (error) return <LoadError />;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Preferências</CardTitle>
          <CardDescription>
            Conta: {session.user.email}. A meta semanal aparece no gráfico do dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResourceForm
            fields={SETTINGS_FIELDS}
            action={saveSettings}
            values={data ?? { weekly_goal_hours: 5 }}
            submitLabel="Salvar preferências"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Alterar senha</CardTitle>
          <CardDescription>A senha é gerenciada pelo Supabase Auth; nada é guardado no app.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResourceForm fields={PASSWORD_FIELDS} action={changePassword} submitLabel="Alterar senha" />
        </CardContent>
      </Card>
    </>
  );
}
