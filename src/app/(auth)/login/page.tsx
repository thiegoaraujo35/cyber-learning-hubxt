import { AuthForm } from "@/components/auth/auth-form";
import { login } from "../actions";

export const metadata = { title: "Entrar — Cyber Learning Hub" };

export default function LoginPage() {
  return <AuthForm mode="login" action={login} />;
}
