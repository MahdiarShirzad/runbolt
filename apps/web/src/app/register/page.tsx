import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create account — Runbolt",
  description: "Create your Runbolt account and build your first workflow in minutes.",
};

export default function RegisterPage() {
  return (
    <AuthLayout
      switchText="Already have an account?"
      switchLabel="Sign in"
      switchHref="/login"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
