import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { VerifyEmailPanel } from "@/components/auth/VerifyEmailPanel";

export const metadata: Metadata = {
  title: "Verify email — Runbolt",
  description: "Verify your email address to activate your Runbolt account.",
};

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      switchText="Already verified?"
      switchLabel="Sign in"
      switchHref="/login"
    >
      <VerifyEmailPanel />
    </AuthLayout>
  );
}
