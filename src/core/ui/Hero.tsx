"use client";

import { useRef } from "react";
import type { Beat, ChapterText } from "../types";
import { gsap, SplitText, useGSAP } from "./gsap";
import DongSonDrum from "./ornaments/DongSonDrum";
import Seal from "./ornaments/Seal";

/** Phân cảnh mở đầu chương: tiêu đề lớn, năm, con dấu, mặt trống đồng xoay chậm phía sau. */
export default function Hero({ chapter, beat, sectionRef, play, loading }: { chapter: ChapterText; beat: Beat; sectionRef: (el: HTMLElement | null) => void; play: boolean; loading: boolean }) {
  const ref = useRef<HTMLElement | null>(null);

  useGSAP(
    () => {
      if (!play) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(".hero__title-text", { type: "chars", mask: "chars", charsClass: "sc" });
        gsap
          .timeline()
          .from(".hero .kicker", { y: 12, opacity: 0, duration: 0.8 })
          .from(split.chars, { yPercent: 110, duration: 1.4, stagger: 0.045, ease: "expo.out" }, 0.1)
          .from(".hero__year", { opacity: 0, letterSpacing: "0.6em", duration: 1.6, ease: "expo.out" }, 0.5)
          .from(".hero .seal", { scale: 2.2, opacity: 0, rotate: -18, duration: 0.5, ease: "back.out(2.2)" }, 1.0)
          .from(".hero__lead, .hero__scroll", { y: 20, opacity: 0, stagger: 0.15, duration: 1 }, 1.1)
          .from(".hero__drum", { opacity: 0, scale: 0.8, duration: 2.4, ease: "expo.out" }, 0);
      });
      // trống mờ dần và trôi lên khi cuộn qua
      gsap.to(".hero__drum", { yPercent: -18, opacity: 0, ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true } });
    },
    { scope: ref, dependencies: [play] },
  );

  return (
    <section
      ref={(el) => {
        ref.current = el;
        sectionRef(el);
      }}
      className="beat beat--hero hero"
      data-beat={beat.id}
    >
      <DongSonDrum className="hero__drum" />
      <div className="hero__content" style={{ visibility: play ? "visible" : "hidden" }}>
        <p className="kicker">{beat.kicker}</p>
        <h1 className="hero__title">
          <span className="hero__title-text">{chapter.title}</span>
          <span className="hero__year">{chapter.year}</span>
          <Seal lines={[chapter.title.split(" ")[0], chapter.year]} />
        </h1>
        <p className="hero__lead">{chapter.lead}</p>
        <p className="hero__scroll">
          {loading ? "Đang dựng cảnh…" : "Cuộn để bắt đầu"}
          <span className="hero__line" />
        </p>
      </div>
    </section>
  );
}
