"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { z } from "zod";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ResourceForm, type Field } from "@/components/crud/resource-form";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
});

const FIELDS: Field[] = [
  { name: "email", label: "E-mail", type: "email", required: true, wide: true, autoComplete: "email" },
  { name: "password", label: "Senha", type: "password", required: true, wide: true, autoComplete: "current-password" },
];

export function LoginForm() {
  const router = useRouter();
  const configured = isSupabaseConfigured();

  // Já está logado? Vai direto para o painel.
  useEffect(() => {
    if (!configured) return;
    getSupabase()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) router.replace("/dashboard");
      });
  }, [configured, router]);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col gap-6 p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff8a3d] to-[#ff4d6d]">
              <ShieldCheck className="size-5 text-white" />
            </span>
            <h1 className="text-xl font-semibold">Cyber Learning Hub</h1>
            <p className="text-sm text-muted-foreground">Acesso restrito. Entre para ver seu painel.</p>
          </div>

          {!configured ? (
            <p role="alert" className="text-sm text-destructive">
              Supabase não configurado: faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
              (no .env.local, ou nas variáveis do repositório no GitHub).
            </p>
          ) : (
            <ResourceForm
              fields={FIELDS}
              schema={schema}
              submitLabel="Entrar"
              onSave={async (data) => {
                const { error } = await getSupabase().auth.signInWithPassword(data);
                if (error) return { error: "E-mail ou senha inválidos." };
                router.replace("/dashboard");
              }}
            />
          )}
        </CardContent>
      </Card>
    </main>
  );
}
