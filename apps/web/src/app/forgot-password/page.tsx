import { pageMetadata } from "@/lib/seo";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = pageMetadata({
  title: "Reset password",
  description: "Reset your Runbolt account password.",
  path: "/forgot-password",
  noIndex: true,
});

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
