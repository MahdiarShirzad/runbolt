import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password — Runbolt",
  description: "Reset your Runbolt account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      switchText="Remembered it?"
      switchLabel="Sign in"
      switchHref="/login"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
