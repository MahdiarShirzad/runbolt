import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Runbolt",
  description: "Sign in to continue building with Runbolt.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      switchText="Don't have an account?"
      switchLabel="Create account"
      switchHref="/register"
    >
      <LoginForm />
    </AuthLayout>
  );
}
