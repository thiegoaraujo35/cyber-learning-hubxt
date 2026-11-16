import { AuthForm } from "@/components/auth/auth-form";
import { signup } from "../actions";

export const metadata = { title: "Criar conta — Cyber Learning Hub" };

export default function SignupPage() {
  return <AuthForm mode="signup" action={signup} />;
}
