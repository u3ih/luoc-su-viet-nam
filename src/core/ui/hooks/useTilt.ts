"use client";

import { useEffect, type RefObject } from "react";

/** Ghi --rx/--ry/--gx/--gy lên thẻ đang trỏ chuột; CSS của thẻ tự dùng. */
export function useTilt(root: RefObject<HTMLElement | null>, selector: string, max = 7) {
  useEffect(() => {
    const el = root.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    let card: HTMLElement | null = null;
    let raf = 0;
    let px = 0;
    let py = 0;
    const paint = () => {
      raf = 0;
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (px - r.left) / r.width;
      const y = (py - r.top) / r.height;
      card.style.setProperty("--ry", `${((x - 0.5) * 2 * max).toFixed(2)}deg`);
      card.style.setProperty("--rx", `${((0.5 - y) * 2 * max).toFixed(2)}deg`);
      card.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
    };
    const reset = (c: HTMLElement) => {
      for (const p of ["--rx", "--ry", "--gx", "--gy"]) c.style.removeProperty(p);
    };
    const onMove = (e: PointerEvent) => {
      const next = (e.target as HTMLElement).closest<HTMLElement>(selector);
      if (next !== card) {
        if (card) reset(card);
        card = next;
      }
      px = e.clientX;
      py = e.clientY;
      if (card && !raf) raf = requestAnimationFrame(paint);
    };
    const onLeave = () => {
      if (card) reset(card);
      card = null;
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [root, selector, max]);
}
