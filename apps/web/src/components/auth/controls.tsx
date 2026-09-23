"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  GitHubIcon,
  GoogleIcon,
} from "../landing/icons";

/* ---------- Card / headers / footers ---------- */

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-6 shadow-[0_16px_48px_-16px_rgba(5,7,12,0.7)] sm:p-8">
      {children}
    </div>
  );
}

export function AuthHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-7">
      <h1 className="text-balance text-2xl font-semibold tracking-tight text-fg">
        {title}
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}

export function AuthFooter({ text, label, href }: { text: string; label: string; href: string }) {
  return (
    <p className="mt-6 text-center text-[13.5px] text-muted">
      {text}{" "}
      <Link href={href} className="font-medium text-info transition-colors hover:text-highlight">
        {label}
      </Link>
    </p>
  );
}

export function Divider({ label = "OR" }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-3" aria-hidden>
      <span className="h-px flex-1 bg-line/70" />
      <span className="font-mono text-[10.5px] tracking-widest text-muted/60">{label}</span>
      <span className="h-px flex-1 bg-line/70" />
    </div>
  );
}

/* ---------- Buttons ---------- */

export function PrimaryButton({
  children,
  loading = false,
  disabled = false,
  full = true,
  onClick,
}: {
  children: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={loading || disabled}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary text-sm font-medium text-white shadow-[0_1px_12px_rgba(59,130,246,0.35)] transition-all duration-200 hover:bg-[#2f76ef] hover:shadow-[0_2px_18px_rgba(59,130,246,0.5)] active:bg-active ${
        full ? "w-full" : ""
      } ${(loading || disabled) && "cursor-not-allowed opacity-60"}`}
    >
      {loading && (
        <span
          className="spin h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white"
          role="status"
          aria-label="Loading"
        />
      )}
      {loading ? "Working…" : children}
    </button>
  );
}

export function SocialButton({
  provider,
  onClick,
}: {
  provider: "GitHub" | "Google";
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 w-full items-center justify-center gap-2.5 rounded-md border border-line bg-surface text-sm font-medium text-fg transition-colors duration-200 hover:bg-hover"
    >
      {provider === "GitHub" ? (
        <GitHubIcon width={15} height={15} className="text-fg" />
      ) : (
        <GoogleIcon width={15} height={15} className="text-muted" />
      )}
      Continue with {provider}
    </button>
  );
}

/* ---------- Banners ---------- */

export function AuthBanner({
  kind,
  title,
  children,
}: {
  kind: "error" | "success";
  title: string;
  children?: ReactNode;
}) {
  const cls =
    kind === "error"
      ? "border-bad/30 bg-bad/[0.07] text-bad"
      : "border-ok/30 bg-ok/[0.07] text-ok";
  return (
    <div
      role={kind === "error" ? "alert" : "status"}
      className={`mb-5 rounded-lg border px-3.5 py-3 text-[13px] ${cls}`}
    >
      <p className="font-medium">{title}</p>
      {children && <div className="mt-0.5 text-muted">{children}</div>}
    </div>
  );
}

/* ---------- Inputs ---------- */

const inputBase =
  "h-10 w-full rounded-md border bg-input px-3 text-sm text-fg outline-none transition-colors duration-200 placeholder:text-muted/50";

export function AuthInput({
  label,
  type = "text",
  name,
  placeholder,
  error,
  autoComplete,
  icon,
  onChange,
}: {
  label: string;
  type?: string;
  name: string;
  placeholder: string;
  error?: string;
  autoComplete?: string;
  icon?: ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-fg">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted/70">
            {icon}
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={onChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${inputBase} ${icon ? "pl-9" : ""} ${
            error
              ? "border-bad/60 focus:border-bad focus:ring-2 focus:ring-bad/25"
              : "border-line focus:border-primary focus:ring-2 focus:ring-primary/25"
          }`}
        />
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-bad">
          <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export function PasswordInput({
  label,
  name,
  placeholder = "Enter your password",
  error,
  autoComplete,
  onChange,
  children,
}: {
  label: string;
  name: string;
  placeholder?: string;
  error?: string;
  autoComplete?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** extra row rendered next to the label (e.g. forgot password) */
  children?: ReactNode;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const errorId = `${id}-error`;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-[13px] font-medium text-fg">
          {label}
        </label>
        {children}
      </div>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={onChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`${inputBase} pr-10 ${
            error
              ? "border-bad/60 focus:border-bad focus:ring-2 focus:ring-bad/25"
              : "border-line focus:border-primary focus:ring-2 focus:ring-primary/25"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-muted transition-colors hover:text-fg"
        >
          {visible ? <EyeOffIcon width={15} height={15} /> : <EyeIcon width={15} height={15} />}
        </button>
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-bad">
          <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------- Password strength ---------- */

export type StrengthLevel = "weak" | "fair" | "strong";

export function passwordStrength(password: string): {
  level: StrengthLevel;
  checks: { label: string; pass: boolean }[];
} {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "Contains a number", pass: /\d/.test(password) },
    { label: "Contains an uppercase letter", pass: /[A-Z]/.test(password) },
  ];
  const passed = checks.filter((c) => c.pass).length;
  const level: StrengthLevel = passed <= 1 ? "weak" : passed === 2 ? "fair" : "strong";
  return { level, checks };
}

const strengthMeta: Record<StrengthLevel, { label: string; bar: string; text: string }> = {
  weak: { label: "Weak", bar: "bg-bad", text: "text-bad" },
  fair: { label: "Fair", bar: "bg-warn", text: "text-warn" },
  strong: { label: "Strong", bar: "bg-ok", text: "text-ok" },
};

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const { level, checks } = passwordStrength(password);
  const meta = strengthMeta[level];
  return (
    <div className="mt-3" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= (level === "weak" ? 0 : level === "fair" ? 1 : 2) ? meta.bar : "bg-line"
              }`}
            />
          ))}
        </div>
        <span className={`font-mono text-[10.5px] uppercase tracking-wider ${meta.text}`}>
          {meta.label}
        </span>
      </div>
      <ul className="mt-2 space-y-1">
        {checks.map((check) => (
          <li key={check.label} className="flex items-center gap-2 text-[12px]">
            <span
              className={`flex h-3.5 w-3.5 items-center justify-center rounded-full ${
                check.pass ? "bg-ok/15 text-ok" : "bg-raised text-muted/50"
              }`}
            >
              {check.pass ? (
                <CheckIcon width={8} height={8} />
              ) : (
                <span className="h-1 w-1 rounded-full bg-current" aria-hidden />
              )}
            </span>
            <span className={check.pass ? "text-muted" : "text-muted/70"}>{check.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
