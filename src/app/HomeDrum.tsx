"use client";

import { useEffect, useRef } from "react";
import { DongSonDrum } from "@/core/ui";
import css from "./HomeDrum.module.scss";

const EMBERS = 14;

// Chỉ máy có chuột mới có parallax: trên điện thoại đổi --sy theo cuộn làm vẽ lại mặt trống mỗi khung
// (giả lập CPU ×4: 40 fps, bỏ đi 57 fps).
export default function HomeDrum() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(prefers-reduced-motion: no-preference) and (pointer: fine)").matches) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    const tick = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      el.style.setProperty("--mx", x.toFixed(4));
      el.style.setProperty("--my", y.toFixed(4));
      el.style.setProperty("--sy", String(Math.min(window.scrollY, window.innerHeight * 1.2) | 0));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
      kick();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", kick, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", kick);
    };
  }, []);

  return (
    <div ref={ref} className={`home__fx ${css.stage}`} aria-hidden="true">
      <div className={css.glow} />
      <div className={css.plane}>
        <DongSonDrum className={css.drum} />
        <div className={css.rim} />
      </div>
      <div className={css.embers}>
        {Array.from({ length: EMBERS }, (_, i) => (
          <span key={i} style={{ "--i": i, left: `${8 + ((i * 37) % 84)}%`, animationDelay: `${-((i * 1.7) % 9)}s`, animationDuration: `${7 + ((i * 5) % 6)}s` } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}
