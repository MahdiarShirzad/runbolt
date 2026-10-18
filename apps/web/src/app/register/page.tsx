import { pageMetadata } from "@/lib/seo";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = pageMetadata({
  title: "Create account",
  description: "Create your Runbolt account and build your first workflow in minutes.",
  path: "/register",
});

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
