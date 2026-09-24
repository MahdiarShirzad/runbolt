"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Reveal } from "../landing/Reveal";
import { BookIcon, EyeIcon, CodeIcon, MailIcon } from "../landing/icons";
import { TerminalIcon } from "../security/icons";
import { FormInput, FormSelect, FormTextarea, InfoRow } from "./FormFields";

type Status = "idle" | "loading" | "success" | "error";

type Errors = {
  name?: string;
  email?: string;
  message?: string;
};

const topicOptions = [
  { value: "general", label: "General Question" },
  { value: "support", label: "Technical Support" },
  { value: "integration", label: "Integration Question" },
  { value: "feedback", label: "Feedback" },
  { value: "security", label: "Security Issue" },
];

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validate(fields: { name: string; email: string; message: string }): Errors {
  const errors: Errors = {};
  if (!fields.name.trim()) {
    errors.name = "Please enter your name.";
  }
  if (!fields.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!isValidEmail(fields.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!fields.message.trim()) {
    errors.message = "Please enter a message.";
  }
  return errors;
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [values, setValues] = useState({
    name: "",
    email: "",
    company: "",
    topic: "general",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (status === "error") setStatus("idle");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    // Simulated submission — static frontend only, nothing is sent
    window.setTimeout(() => {
      setStatus("success");
    }, 1200);
  }

  function handleReset() {
    setValues({ name: "", email: "", company: "", topic: "general", message: "" });
    setErrors({});
    setStatus("idle");
  }

  if (status === "success") {
    return (
      <div
        className="rounded-[10px] border border-ok/30 bg-surface p-8 text-center shadow-[0_24px_80px_-24px_rgba(3,5,9,0.95)] sm:p-10"
        role="status"
        aria-live="polite"
      >
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-ok/40 bg-ok/10 text-ok">
          <svg
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m4.5 12.5 5 5 10-11" />
          </svg>
        </span>
        <h3 className="mt-5 text-xl font-semibold tracking-tight text-fg">
          Message received.
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
          Thanks for reaching out. We&apos;ll review your message.
        </p>
        <p className="mt-4 font-mono text-[11px] text-muted/60">
          simulated · frontend only · nothing was sent
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-md border border-line bg-surface/60 px-5 text-sm font-medium text-fg transition-colors duration-200 hover:border-line-strong hover:bg-hover"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-line bg-surface shadow-[0_24px_80px_-24px_rgba(3,5,9,0.95)]">
      <div className="flex items-center gap-3 border-b border-line/80 bg-raised/60 px-5 py-3">
        <p className="font-mono text-xs text-muted">
          runbolt<span className="text-line-strong">/</span>
          <span className="text-fg">contact</span>
        </p>
        <span className="ml-auto rounded border border-line bg-code px-2 py-0.5 font-mono text-[10px] text-muted">
          static · demo
        </span>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5 p-5 sm:p-7">
        {status === "error" && Object.keys(errors).length > 0 && (
          <div
            role="alert"
            className="rounded-lg border border-bad/30 bg-bad/[0.07] px-3.5 py-3 text-[13px] text-bad"
          >
            <p className="font-medium">Please fix the errors below.</p>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <FormInput
            label="Name"
            name="name"
            placeholder="Ada Lovelace"
            autoComplete="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            disabled={status === "loading"}
          />
          <FormInput
            label="Email"
            name="email"
            type="email"
            placeholder="ada@example.com"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            disabled={status === "loading"}
          />
        </div>

        <FormInput
          label="Company"
          name="company"
          optional
          placeholder="Acme Inc."
          autoComplete="organization"
          value={values.company}
          onChange={handleChange}
          disabled={status === "loading"}
        />

        <FormSelect
          label="Topic"
          name="topic"
          options={topicOptions}
          value={values.topic}
          onChange={handleChange}
          disabled={status === "loading"}
        />

        <FormTextarea
          label="Message"
          name="message"
          placeholder="Tell us about your question, integration, or feedback…"
          value={values.message}
          onChange={handleChange}
          error={errors.message}
          disabled={status === "loading"}
        />

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={status === "loading"}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-button-text transition-all duration-200 hover:bg-primary-strong active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {status === "loading" && (
              <span
                className="spin h-3.5 w-3.5 rounded-full border-2 border-button-text/30 border-t-button-text"
                role="status"
                aria-label="Sending"
              />
            )}
            {status === "loading" ? "Sending..." : "Send Message"}
          </button>
          <p className="font-mono text-[10.5px] leading-relaxed text-muted/60">
            UI simulation only — no data leaves this page.
          </p>
        </div>
      </form>
    </div>
  );
}

/* Right column — contact information / helpful links */

function SidePanel() {
  return (
    <div className="space-y-5">
      <div className="rounded-[10px] border border-line bg-surface/60 p-5 sm:p-6">
        <p className="font-mono text-[10.5px] uppercase tracking-widest text-muted/70">
          helpful paths
        </p>
        <div className="mt-5 space-y-5">
          <InfoRow
            icon={<BookIcon width={15} height={15} />}
            title="Documentation"
            text="Guides, concepts, and API references — often the fastest answer."
          >
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-primary"
            >
              Browse docs
              <span aria-hidden>→</span>
            </Link>
          </InfoRow>
          <InfoRow
            icon={<TerminalIcon width={15} height={15} />}
            title="Technical support"
            text="Questions about workflows, nodes, or execution behavior."
          >
            <span className="font-mono text-[11px] text-muted/70">
              topic · Technical Support
            </span>
          </InfoRow>
          <InfoRow
            icon={<EyeIcon width={15} height={15} />}
            title="Security"
            text="Report a potential security concern through the security page."
          >
            <Link
              href="/security"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-primary"
            >
              Security page
              <span aria-hidden>→</span>
            </Link>
          </InfoRow>
          <InfoRow
            icon={<CodeIcon width={15} height={15} />}
            title="Integrations"
            text="Discuss how Runbolt connects to the tools in your stack."
          >
            <span className="font-mono text-[11px] text-muted/70">
              topic · Integration Question
            </span>
          </InfoRow>
        </div>
      </div>

      <div className="rounded-[10px] border border-line bg-code/70 p-5 sm:p-6">
        <p className="font-mono text-[10.5px] uppercase tracking-widest text-muted/70">
          before you write
        </p>
        <ul className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-muted">
          <li className="flex gap-2.5">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-highlight" aria-hidden />
            Include the workflow or step name when asking about execution.
          </li>
          <li className="flex gap-2.5">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-highlight" aria-hidden />
            Do not paste credentials, tokens, or customer data.
          </li>
          <li className="flex gap-2.5">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-highlight" aria-hidden />
            For security reports, prefer the Security page path.
          </li>
        </ul>
        <p className="mt-5 flex items-center gap-2 border-t border-line/60 pt-4 font-mono text-[11px] text-muted/60">
          <MailIcon width={12} height={12} />
          form → review → reply (conceptual)
        </p>
      </div>
    </div>
  );
}

export function ContactFormSection() {
  return (
    <section
      id="contact-form"
      className="border-y border-line/70 bg-surface/30 py-20 sm:py-28"
      aria-labelledby="form-heading"
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs text-highlight">Send a message</p>
          <h2
            id="form-heading"
            className="mt-3 text-balance text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            Tell us what you need.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted">
            Questions, support, integrations, feedback — pick a topic and send
            a message. This form is a frontend demo and does not deliver mail.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-10">
          <Reveal delay={80}>
            <ContactForm />
          </Reveal>
          <Reveal delay={160}>
            <SidePanel />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
