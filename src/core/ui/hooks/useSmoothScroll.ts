"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../gsap";

/** Cuộn mượt (Lenis) đồng bộ với GSAP ScrollTrigger. Tắt khi người dùng chọn giảm chuyển động. */
export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.9 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return {
    scrollTo(top: number) {
      if (lenisRef.current) lenisRef.current.scrollTo(top, { duration: 2.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
      else window.scrollTo({ top, behavior: "smooth" });
    },
  };
}
