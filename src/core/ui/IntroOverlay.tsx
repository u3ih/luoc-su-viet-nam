"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "./gsap";
import DongSonDrum from "./ornaments/DongSonDrum";

/**
 * Màn mở đầu: trống đồng xoay chậm trong lúc dựng cảnh, rồi "mở màn" bằng
 * vòng tròn loang ra từ tâm trống. Gọi onDone khi màn đã mở.
 */
export default function IntroOverlay({ ready, numeral, title, onDone }: { ready: boolean; numeral: string; title: string; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      gsap.from(".intro__drum", { scale: 0.6, opacity: 0, duration: 1.6, ease: "expo.out" });
      gsap.from(".intro__text > *", { y: 16, opacity: 0, stagger: 0.12, delay: 0.3 });
    },
    { scope: ref },
  );

  useGSAP(
    () => {
      if (!ready) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tl = gsap.timeline({
        delay: 0.4,
        onComplete: () => {
          setGone(true);
          onDone();
        },
      });
      if (reduced) tl.to(ref.current, { opacity: 0, duration: 0.4 });
      else
        tl.to(".intro__text", { opacity: 0, y: -10, duration: 0.5 })
          .to(".intro__drum", { scale: 2.6, opacity: 0, duration: 1.6, ease: "power2.in" }, "<")
          .fromTo(ref.current, { clipPath: "circle(150% at 50% 50%)" }, { clipPath: "circle(0% at 50% 50%)", duration: 1.3, ease: "power3.inOut" }, "-=0.9");
    },
    { scope: ref, dependencies: [ready] },
  );

  if (gone) return null;
  return (
    <div ref={ref} className="intro" role="status" aria-live="polite">
      <DongSonDrum className="intro__drum" />
      <div className="intro__text">
        <p className="kicker">Chương {numeral}</p>
        <p className="intro__title">{title}</p>
        <p className="intro__hint">{ready ? "Mở màn" : "Đang dựng cảnh…"}</p>
      </div>
    </div>
  );
}
