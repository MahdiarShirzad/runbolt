import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";

/* ---------- FormInput ---------- */

type FormInputProps = {
  label: string;
  name: string;
  error?: string;
  optional?: boolean;
  placeholder?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "id">;

export function FormInput({
  label,
  name,
  error,
  optional,
  placeholder,
  ...rest
}: FormInputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 flex items-baseline gap-2 text-[13px] font-medium text-fg">
        {label}
        {optional && (
          <span className="font-mono text-[10.5px] font-normal text-muted/70">optional</span>
        )}
      </label>
      <input
        id={id}
        name={name}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`h-11 w-full rounded-md border bg-input px-3.5 text-sm text-fg outline-none transition-all duration-200 placeholder:text-muted/50 ${
          error
            ? "border-bad/60 focus:border-bad focus:ring-2 focus:ring-bad/25"
            : "border-line focus:border-primary focus:ring-2 focus:ring-primary/25"
        }`}
        {...rest}
      />
      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-bad">
          <svg
            viewBox="0 0 24 24"
            width={12}
            height={12}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------- FormSelect ---------- */

type FormSelectProps = {
  label: string;
  name: string;
  error?: string;
  options: { value: string; label: string }[];
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "name" | "id" | "children">;

export function FormSelect({ label, name, error, options, ...rest }: FormSelectProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-fg">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-11 w-full appearance-none rounded-md border bg-input px-3.5 pr-10 text-sm text-fg outline-none transition-all duration-200 ${
            error
              ? "border-bad/60 focus:border-bad focus:ring-2 focus:ring-bad/25"
              : "border-line focus:border-primary focus:ring-2 focus:ring-primary/25"
          }`}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface text-fg">
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-bad">
          <svg
            viewBox="0 0 24 24"
            width={12}
            height={12}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------- FormTextarea ---------- */

type FormTextareaProps = {
  label: string;
  name: string;
  error?: string;
  placeholder?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name" | "id">;

export function FormTextarea({ label, name, error, placeholder, ...rest }: FormTextareaProps) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-fg">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        placeholder={placeholder}
        rows={6}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full resize-y rounded-md border bg-input px-3.5 py-3 text-sm leading-relaxed text-fg outline-none transition-all duration-200 placeholder:text-muted/50 ${
          error
            ? "border-bad/60 focus:border-bad focus:ring-2 focus:ring-bad/25"
            : "border-line focus:border-primary focus:ring-2 focus:ring-primary/25"
        }`}
        {...rest}
      />
      {error && (
        <p id={errorId} className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-bad">
          <svg
            viewBox="0 0 24 24"
            width={12}
            height={12}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------- Shared side panel row ---------- */

export function InfoRow({
  icon,
  title,
  text,
  children,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex gap-3.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-line bg-raised text-highlight">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-fg">{title}</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{text}</p>
        {children && <div className="mt-2">{children}</div>}
      </div>
    </div>
  );
}
