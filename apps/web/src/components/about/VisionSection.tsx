"use client";

import { useEffect, useRef } from "react";
import { Reveal } from "../landing/Reveal";

/**
 * Subtle animated workflow graph + gentle parallax behind the vision statement.
 * Respects prefers-reduced-motion via CSS animations and an early return here.
 */
function WorkflowGraphBackdrop() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = el.getBoundingClientRect();
        const viewH = window.innerHeight || 1;
        const progress = (viewH - rect.top) / (viewH + rect.height);
        const offset = (progress - 0.5) * 36;
        el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 will-change-transform"
    >
      <div className="bg-grid mask-fade-radial absolute inset-0 opacity-40" />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 560"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Edges */}
        <path
          d="M120 120 C 260 120, 300 220, 440 220"
          stroke="#232C3B"
          strokeWidth="1.5"
        />
        <path
          d="M440 220 C 560 220, 600 140, 740 140"
          stroke="#232C3B"
          strokeWidth="1.5"
        />
        <path
          d="M440 220 C 580 220, 620 340, 780 340"
          stroke="#232C3B"
          strokeWidth="1.5"
        />
        <path
          d="M740 140 C 880 140, 920 260, 1060 260"
          stroke="#232C3B"
          strokeWidth="1.5"
        />
        <path
          d="M780 340 C 900 340, 940 260, 1060 260"
          stroke="#232C3B"
          strokeWidth="1.5"
        />
        <path
          d="M120 420 C 280 420, 320 340, 440 340"
          stroke="#232C3B"
          strokeWidth="1.5"
          opacity="0.7"
        />
        <path
          d="M440 340 C 560 340, 600 440, 760 440"
          stroke="#232C3B"
          strokeWidth="1.5"
          opacity="0.7"
        />

        {/* Flowing comets along edges */}
        <path
          className="edge-flow"
          style={{ stroke: "#C7F04E", strokeWidth: 2, animationDelay: "0s" }}
          d="M120 120 C 260 120, 300 220, 440 220"
        />
        <path
          className="edge-flow"
          style={{ stroke: "#C7F04E", strokeWidth: 2, animationDelay: "0.8s" }}
          d="M440 220 C 560 220, 600 140, 740 140"
        />
        <path
          className="edge-flow"
          style={{ stroke: "#A08BF0", strokeWidth: 2, animationDelay: "1.4s" }}
          d="M440 220 C 580 220, 620 340, 780 340"
        />
        <path
          className="edge-flow"
          style={{ stroke: "#3ECF8E", strokeWidth: 2, animationDelay: "2s" }}
          d="M740 140 C 880 140, 920 260, 1060 260"
        />
        <path
          className="edge-flow"
          style={{ stroke: "#C7F04E", strokeWidth: 2, animationDelay: "2.5s" }}
          d="M780 340 C 900 340, 940 260, 1060 260"
        />

        {/* Nodes */}
        {[
          { x: 120, y: 120, c: "#C7F04E" },
          { x: 440, y: 220, c: "#C7F04E" },
          { x: 740, y: 140, c: "#5CC9EE" },
          { x: 780, y: 340, c: "#A08BF0" },
          { x: 1060, y: 260, c: "#3ECF8E" },
          { x: 120, y: 420, c: "#F5B23C" },
          { x: 440, y: 340, c: "#C7F04E" },
          { x: 760, y: 440, c: "#C7F04E" },
        ].map((n) => (
          <g key={`${n.x}-${n.y}`}>
            <circle cx={n.x} cy={n.y} r="14" fill="#0A0D13" stroke={n.c} strokeWidth="1.5" opacity="0.9" />
            <circle cx={n.x} cy={n.y} r="4.5" fill={n.c} />
          </g>
        ))}
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(11,15,23,0.2),rgba(11,15,23,0.85))]" />
    </div>
  );
}

export function VisionSection() {
  return (
    <section
      className="relative overflow-hidden py-28 sm:py-36"
      aria-labelledby="vision-heading"
    >
      <WorkflowGraphBackdrop />

      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-highlight">
            Vision
          </p>
        </Reveal>

        <Reveal delay={100}>
          <h2
            id="vision-heading"
            className="mx-auto mt-6 max-w-3xl text-balance text-3xl font-semibold leading-[1.14] tracking-tight sm:text-5xl"
          >
            An execution layer for the workflows of modern software.
          </h2>
        </Reveal>

        <Reveal delay={200}>
          <p className="mx-auto mt-7 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
            Runbolt is being built toward a world where automation is not a
            collection of disconnected scripts and tools, but a clear,
            observable, composable part of the software stack.
          </p>
        </Reveal>

        <Reveal delay={300}>
          <div
            aria-hidden
            className="mx-auto mt-10 h-px w-40 bg-gradient-to-r from-transparent via-primary to-transparent"
          />
        </Reveal>
      </div>
    </section>
  );
}
