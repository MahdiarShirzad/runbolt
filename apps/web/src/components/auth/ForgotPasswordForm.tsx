"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AuthCard,
  AuthFooter,
  AuthHeader,
  AuthInput,
  PrimaryButton,
} from "./controls";
import { ArrowLeftIcon, MailIcon } from "../landing/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(undefined);
    setLoading(true);
    // Static demo: replace with the real reset request later.
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1200);
  }

  if (sent) {
    return (
      <AuthCard>
        <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-full border border-ok/30 bg-ok/10 text-ok">
          <MailIcon width={18} height={18} />
        </div>
        <AuthHeader
          title="Check your inbox."
          description={`We've sent password reset instructions to ${email}. If it doesn't arrive within a few minutes, check your spam folder.`}
        />
        <Link href="/login">
          <span className="inline-flex h-10 items-center gap-2 rounded-md border border-line bg-surface px-4 text-sm font-medium text-fg transition-colors hover:bg-hover">
            <ArrowLeftIcon width={14} height={14} className="text-muted" />
            Back to sign in
          </span>
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <AuthHeader
        title="Reset your password."
        description="Enter your email and we'll show you how to continue."
      />

      <form onSubmit={onSubmit} noValidate>
        <AuthInput
          label="Email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          icon={<MailIcon width={14} height={14} />}
          error={error}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="mt-6">
          <PrimaryButton loading={loading}>Send reset link</PrimaryButton>
        </div>
      </form>

      <AuthFooter text="Remembered it?" label="Back to sign in" href="/login" />
    </AuthCard>
  );
}
