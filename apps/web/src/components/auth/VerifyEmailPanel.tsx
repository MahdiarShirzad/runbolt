"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCard, AuthHeader, PrimaryButton } from "./controls";
import { CheckIcon, MailIcon } from "../landing/icons";

export function VerifyEmailPanel() {
  const [sending, setSending] = useState(false);
  const [resent, setResent] = useState(false);

  function onResend() {
    setSending(true);
    // Static demo: replace with the real resend call later.
    setTimeout(() => {
      setSending(false);
      setResent(true);
    }, 1200);
  }

  return (
    <AuthCard>
      <div className="relative mb-6 h-12 w-12">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-info/30 bg-info/10 text-info">
          <MailIcon width={20} height={20} />
        </span>
        <span
          className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-surface bg-ok text-ok"
          aria-label="Email sent"
        >
          <span className="flex h-full w-full items-center justify-center rounded-full bg-ok/15">
            <CheckIcon width={10} height={10} className="text-ok" />
          </span>
        </span>
      </div>

      <AuthHeader
        title="Verify your email."
        description="Check your inbox to verify your Runbolt account. The link is valid for 24 hours."
      />

      {resent && (
        <p
          role="status"
          className="mb-5 rounded-lg border border-ok/30 bg-ok/[0.07] px-3.5 py-3 text-[13px] text-ok"
        >
          Verification email sent — check your inbox.
        </p>
      )}

      <PrimaryButton loading={sending} onClick={onResend}>
        Resend email
      </PrimaryButton>

      <p className="mt-6 text-center text-[13.5px] text-muted">
        Didn't receive the email?{" "}
        <button
          type="button"
          onClick={onResend}
          className="font-medium text-info transition-colors hover:text-highlight"
        >
          Resend email
        </button>
      </p>
      <p className="mt-1.5 text-center text-[13.5px] text-muted">
        Wrong address?{" "}
        <Link href="/register" className="font-medium text-info transition-colors hover:text-highlight">
          Change email
        </Link>
      </p>
    </AuthCard>
  );
}
