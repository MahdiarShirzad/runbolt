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
  PasswordStrength,
  PrimaryButton,
  SocialButton,
} from "./controls";
import { MailIcon } from "../landing/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: Record<string, string | undefined> = {};
    if (!name.trim()) next.name = "Enter your name.";
    if (!EMAIL_RE.test(email)) next.email = "Please enter a valid email address.";
    if (password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) {
      next.password = "Meet the requirements below to continue.";
    }
    if (confirm !== password) next.confirm = "Passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    // Static demo: replace with the real registration call later.
    setTimeout(() => {
      setLoading(false);
      setCreated(true);
    }, 1200);
  }

  if (created) {
    return (
      <AuthCard>
        <AuthHeader
          title="Check your inbox."
          description={`We sent a verification link to ${email}. Verify your email to activate your workspace.`}
        />
        <AuthBanner kind="success" title="Account created.">
          One more step — verify your email address.
        </AuthBanner>
        <Link
          href="/verify-email"
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-white shadow-[0_1px_12px_rgba(59,130,246,0.35)] transition-all duration-200 hover:bg-[#2f76ef]"
        >
          Open verification page
        </Link>
        <AuthFooter text="Didn't use this address?" label="Go back" href="/register" />
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Create your Runbolt account."
        description="Build your first workflow in minutes."
      />

      <form onSubmit={onSubmit} noValidate>
        <div className="space-y-4">
          <AuthInput
            label="Name"
            name="name"
            placeholder="Ada Lovelace"
            autoComplete="name"
            error={errors.name}
            onChange={(e) => setName(e.target.value)}
          />
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
          <div>
            <PasswordInput
              label="Password"
              name="password"
              autoComplete="new-password"
              error={errors.password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordStrength password={password} />
          </div>
          <PasswordInput
            label="Confirm Password"
            name="confirm-password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            error={errors.confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <div className="mt-6">
          <PrimaryButton loading={loading}>Create account</PrimaryButton>
        </div>
      </form>

      <p className="mt-4 text-center text-[12px] leading-relaxed text-muted/80">
        By creating an account, you agree to the{" "}
        <Link href="#" className="text-info transition-colors hover:text-highlight">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="text-info transition-colors hover:text-highlight">
          Privacy Policy
        </Link>
        .
      </p>

      <Divider />
      <SocialButton provider="GitHub" />

      <AuthFooter text="Already have an account?" label="Sign in" href="/login" />
    </AuthCard>
  );
}
