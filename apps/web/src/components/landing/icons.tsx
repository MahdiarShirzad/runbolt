import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps): IconProps {
  return {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...props,
  };
}

export function BoltIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M13.2 2.1 4.6 13.1c-.3.4 0 .9.5.9h5.1l-1.3 7.6c-.1.5.6.8.9.4l8.7-11.1c.3-.4 0-.9-.5-.9h-5.2l1.3-7.5c.1-.5-.6-.8-.9-.4Z" />
    </svg>
  );
}

export function NodeGraphIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2.5" y="9.5" width="5" height="5" rx="1.2" />
      <rect x="16.5" y="3" width="5" height="5" rx="1.2" />
      <rect x="16.5" y="16" width="5" height="5" rx="1.2" />
      <path d="M7.5 12h4.5c1.1 0 2 .9 2 2v4.5M14 9.5V7c0-1.1.9-2 2-2h.5" />
    </svg>
  );
}

export function PulseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2.5 12h4l2.5-7 5 14 2.5-7h5" />
    </svg>
  );
}

export function CodeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m8 8-4.5 4L8 16M16 8l4.5 4L16 16M13.5 4.5l-3 15" />
    </svg>
  );
}

export function WorkerIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="4" width="18" height="6.5" rx="1.5" />
      <rect x="3" y="13.5" width="18" height="6.5" rx="1.5" />
      <path d="M6.5 7.2h.01M6.5 16.8h.01M10 7.2h4M10 16.8h4" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={2.4}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12h16m0 0-6-6m6 6-6 6" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m5.5 5.5 13 13m0-13-13 13" />
    </svg>
  );
}

export function ZapIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M13.2 2.1 4.6 13.1c-.3.4 0 .9.5.9h5.1l-1.3 7.6c-.1.5.6.8.9.4l8.7-11.1c.3-.4 0-.9-.5-.9h-5.2l1.3-7.5c.1-.5-.6-.8-.9-.4Z" />
    </svg>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5a2 2 0 0 1 2-2h13.5v16.5H6.5A2.5 2.5 0 0 0 4 21.5V5Z" />
      <path d="M19.5 15.5H6.5A2.5 2.5 0 0 0 4 18" />
    </svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M2.5 12h19M12 2.5c2.6 2.6 4 6 4 9.5s-1.4 6.9-4 9.5c-2.6-2.6-4-6-4-9.5s1.4-6.9 4-9.5Z" />
    </svg>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 5h18l-7 8v5.5l-4 2v-7.5L3 5Z" />
    </svg>
  );
}

export function DbIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <ellipse cx="12" cy="5.5" rx="8" ry="3" />
      <path d="M4 5.5V12c0 1.7 3.6 3 8 3s8-1.3 8-3V5.5" />
      <path d="M4 12v6.5c0 1.7 3.6 3 8 3s8-1.3 8-3V12" />
    </svg>
  );
}

export function ShuffleIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 6.5h3.5c5 0 6 11 11 11H21M3 17.5h3.5c2 0 3.2-1.6 4.2-3.5M21 6.5h-3.5c-2 0-3.2 1.6-4.2 3.5" />
      <path d="m18 3.5 3 3-3 3M18 14.5l3 3-3 3" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function QueueIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h16M4 12h16M4 18h10" />
      <path d="M18.5 16.5v5M16 19h5" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="9" y="9" width="11.5" height="11.5" rx="2" />
      <path d="M5.5 14.5H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 2 2v.5" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function RetryIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 12a8 8 0 1 1-2.5-5.8M20 3.5V7h-3.5" />
    </svg>
  );
}

export function GitHubIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49l-.01-1.72c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.34 1.12 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9l-.01 2.81c0 .27.18.6.69.49A10.25 10.25 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.8-3.8" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 12H4m0 0 6-6m-6 6 6 6" />
    </svg>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 4l16 16M10 5.3A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-2.4 3.2M6.1 6.9C3.9 8.5 2.5 12 2.5 12S6 18.5 12 18.5c1.5 0 2.9-.4 4.1-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

export function GoogleIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="currentColor" stroke="none">
      <path d="M21.6 12.2c0-.7-.06-1.4-.18-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.75 3-4.3 3-7.4Z" />
      <path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a5.9 5.9 0 0 1-5.5-4H3.2v2.6A10 10 0 0 0 12 22Z" />
      <path d="M6.5 14.1a6 6 0 0 1 0-3.8V7.7H3.2a10 10 0 0 0 0 9l3.3-2.6Z" />
      <path d="M12 6.1c1.5 0 2.8.5 3.8 1.5L18.7 5A10 10 0 0 0 3.2 7.7l3.3 2.6a5.9 5.9 0 0 1 5.5-4.2Z" />
    </svg>
  );
}

export function WebhookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9.5 8a4 4 0 1 1 5.4 4.5L18 18a2.4 2.4 0 1 1-2.1 1.2L12 13.5M8.5 14.5 5.5 9.6A4 4 0 1 0 8 16.5" />
    </svg>
  );
}
