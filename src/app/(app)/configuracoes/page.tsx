"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading, LoadError, ModuleHeader } from "@/components/crud/module-shell";
import { ResourceForm, type Field } from "@/components/crud/resource-form";
import { useAsync } from "@/lib/db";
import { passwordSchema, settingsSchema } from "@/lib/schemas";
import { getSupabase } from "@/lib/supabase/client";

const SETTINGS_FIELDS: Field[] = [
  { name: "display_name", label: "Nome de exibição", type: "text", placeholder: "Como você quer ser chamado" },
  { name: "weekly_goal_hours", label: "Meta semanal de estudo (horas)", type: "number", min: 0, max: 168, step: 0.5, required: true },
];

const PASSWORD_FIELDS: Field[] = [
  { name: "new_password", label: "Nova senha (mín. 8 caracteres)", type: "password", required: true },
  { name: "confirm_password", label: "Confirmar nova senha", type: "password", required: true },
];

export default function Page() {
  const { data, error } = useAsync(async () => {
    const supabase = getSupabase();
    const [{ data: userData }, { data: settings, error: settingsError }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("user_settings").select("display_name,weekly_goal_hours").maybeSingle(),
    ]);
    if (settingsError) throw new Error(settingsError.message);
    return { user: userData.user, settings };
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <ModuleHeader title="Configurações" description="Preferências da conta e do sistema." />
      {error ? (
        <LoadError detail={error} />
      ) : !data ? (
        <Loading />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Preferências</CardTitle>
              <CardDescription>
                Conta: {data.user?.email}. A meta semanal aparece no gráfico do dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResourceForm
                fields={SETTINGS_FIELDS}
                schema={settingsSchema}
                values={data.settings ?? { weekly_goal_hours: 5 }}
                submitLabel="Salvar preferências"
                onSave={async (d) => {
                  const supabase = getSupabase();
                  const { data: u } = await supabase.auth.getUser();
                  if (!u.user) return { error: "Sessão expirada. Entre novamente." };
                  const { error: err } = await supabase
                    .from("user_settings")
                    .upsert({ user_id: u.user.id, ...d }, { onConflict: "user_id" });
                  if (err) return { error: "Não foi possível salvar. Tente novamente." };
                  return { message: "Configurações salvas." };
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Alterar senha</CardTitle>
              <CardDescription>A senha é gerenciada pelo Supabase Auth; nada é guardado no app.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResourceForm
                fields={PASSWORD_FIELDS}
                schema={passwordSchema}
                submitLabel="Alterar senha"
                resetOnSuccess
                onSave={async (d) => {
                  const { error: err } = await getSupabase().auth.updateUser({ password: d.new_password });
                  if (err) return { error: "Não foi possível alterar a senha. Tente novamente." };
                  return { message: "Senha alterada." };
                }}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
