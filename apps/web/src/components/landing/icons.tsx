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

export function WebhookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9.5 8a4 4 0 1 1 5.4 4.5L18 18a2.4 2.4 0 1 1-2.1 1.2L12 13.5M8.5 14.5 5.5 9.6A4 4 0 1 0 8 16.5" />
    </svg>
  );
}
