"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthState } from "@/app/(auth)/actions";

type Props = {
  mode: "login" | "signup";
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
};

export function AuthForm({ mode, action }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const isLogin = mode === "login";

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col gap-6 p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff8a3d] to-[#ff4d6d]">
              <ShieldCheck className="size-5 text-white" />
            </span>
            <h1 className="text-xl font-semibold">Cyber Learning Hub</h1>
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Entre para acessar seu painel." : "Crie sua conta pessoal."}
            </p>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={8}
                required
              />
            </div>

            {state.error && (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            )}
            {state.message && <p className="text-sm text-primary">{state.message}</p>}

            <Button type="submit" disabled={pending}>
              {pending ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Ainda não tem conta? " : "Já tem conta? "}
            <Link
              href={isLogin ? "/cadastro" : "/login"}
              className="text-primary hover:underline"
            >
              {isLogin ? "Cadastre-se" : "Entrar"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
