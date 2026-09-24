"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AuthBanner,
  AuthCard,
  AuthFooter,
  AuthHeader,
  AuthInput,
  Divider,
  PasswordInput,
  PrimaryButton,
  SocialButton,
} from "./controls";
import { MailIcon } from "../landing/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState<"success" | "bad-password" | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email)) next.email = "Please enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    setOutcome(null);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    // Static demo: short passwords simulate a failed sign-in, everything
    // else simulates success. Replace with the real auth call later.
    setTimeout(() => {
      setLoading(false);
      setOutcome(password.length < 8 ? "bad-password" : "success");
    }, 1200);
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Welcome back."
        description="Sign in to continue building with Runbolt."
      />

      {outcome === "bad-password" && (
        <AuthBanner kind="error" title="Password is incorrect.">
          Check your password and try again, or reset it below.
        </AuthBanner>
      )}
      {outcome === "success" && (
        <AuthBanner kind="success" title="Signed in.">
          Redirecting you to your dashboard — this static demo stops here.
        </AuthBanner>
      )}

      <form onSubmit={onSubmit} noValidate>
        <div className="space-y-4">
          <AuthInput
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            icon={<MailIcon width={14} height={14} />}
            error={errors.email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput
            label="Password"
            name="password"
            autoComplete="current-password"
            error={errors.password}
            onChange={(e) => setPassword(e.target.value)}
          >
            <Link
              href="/forgot-password"
              className="text-[12.5px] text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-primary"
            >
              Forgot password?
            </Link>
          </PasswordInput>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-[13px] text-muted">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-line bg-input accent-primary"
          />
          Remember me for 30 days
        </label>

        <div className="mt-6">
          <PrimaryButton loading={loading}>Sign in</PrimaryButton>
        </div>
      </form>

      <Divider />
      <div className="space-y-2.5">
        <SocialButton provider="GitHub" />
        <SocialButton provider="Google" />
      </div>

      <AuthFooter
        text="Don't have a Runbolt account?"
        label="Create one"
        href="/register"
      />
    </AuthCard>
  );
}
