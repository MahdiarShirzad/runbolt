"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "./Reveal";

type Stat = {
  value: number;
  decimals: number;
  suffix: string;
  label: string;
};

const stats: Stat[] = [
  { value: 99.99, decimals: 2, suffix: "%", label: "workflow reliability" },
  { value: 820, decimals: 0, suffix: "M+", label: "executions per month" },
  { value: 45, decimals: 0, suffix: "ms", label: "p99 trigger latency" },
  { value: 99.98, decimals: 2, suffix: "%", label: "platform uptime" },
];

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function Counter({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState<string>(() =>
    stat.value.toFixed(stat.decimals),
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return; // keep the static final value

    let raf = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 1400;
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          setDisplay((stat.value * easeOutCubic(t)).toFixed(stat.decimals));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [stat.value, stat.decimals]);

  return (
    <span
      ref={ref}
      className="font-mono text-4xl font-semibold tracking-tight text-fg tabular-nums sm:text-5xl"
    >
      {display}
      <span className="bg-gradient-to-r from-primary to-highlight bg-clip-text text-transparent">
        {stat.suffix}
      </span>
    </span>
  );
}

export function Metrics() {
  return (
    <section className="relative border-y border-line/70 bg-surface/40 py-16 sm:py-20" aria-label="Platform metrics">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
                <dt className="order-2 text-sm text-muted">{stat.label}</dt>
                <dd className="order-1">
                  <Counter stat={stat} />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
        <Reveal delay={100}>
          <p className="mt-12 text-center text-sm text-muted lg:text-left">
            Built for modern engineering teams — from two-person startups to
            platform orgs running millions of workflows a day.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
