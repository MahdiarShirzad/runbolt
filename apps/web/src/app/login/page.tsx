import { pageMetadata } from "@/lib/seo";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to continue building with Runbolt.",
  path: "/login",
});

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
