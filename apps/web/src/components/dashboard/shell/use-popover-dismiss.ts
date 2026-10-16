"use client";

import { useEffect, useRef } from "react";

/**
 * Closes a popover on outside pointerdown or Escape. Returns a ref that
 * must wrap the popover (trigger + panel) so inside clicks stay open.
 */
export function usePopoverDismiss<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const node = ref.current;
      if (node && !node.contains(event.target as Node)) onClose();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return ref;
}
