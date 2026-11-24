"use client";

import { useRef } from "react";
import { DongSonDrum, Kicker, Seal } from "@/core/ui";
import type { Beat, ChapterText } from "../types";
import { gsap, SplitText, useGSAP } from "./gsap";

type Props = {
  chapter: ChapterText;
  beat: Beat;
  sectionRef: (el: HTMLElement | null) => void;
  play: boolean;
  loading: boolean;
  onStart: () => void;
};

/** Phân cảnh mở đầu chương: tiêu đề lớn, năm, con dấu, mặt trống đồng xoay chậm phía sau. */
export default function Hero({ chapter, beat, sectionRef, play, loading, onStart }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const drum = chapter.heroDrum !== false;

  useGSAP(
    () => {
      if (!play) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // tách theo từ rồi mới tới ký tự: mỗi từ là một khối, trình duyệt chỉ xuống dòng giữa các từ (không ngắt "Lo|a")
        const split = SplitText.create(".hero__title-text", { type: "words,chars", mask: "chars", wordsClass: "sw", charsClass: "sc" });
        gsap
          .timeline()
          .from(".hero .kicker", { y: 12, opacity: 0, duration: 0.8 })
          .from(split.chars, { yPercent: 110, rotateX: -95, transformPerspective: 600, transformOrigin: "50% 100%", duration: 1.6, stagger: 0.045, ease: "expo.out" }, 0.1)
          .from(".hero__year", { opacity: 0, letterSpacing: "0.6em", duration: 1.6, ease: "expo.out" }, 0.5)
          .from(".hero .seal", { scale: 2.2, opacity: 0, rotate: -18, duration: 0.5, ease: "back.out(2.2)" }, 1.0)
          .from(".hero__lead, .hero__scroll", { y: 20, opacity: 0, stagger: 0.15, duration: 1 }, 1.1);
        if (drum) gsap.from(".hero__drum", { opacity: 0, scale: 0.8, duration: 2.4, ease: "expo.out" });
      });
      // trống mờ dần và trôi lên khi cuộn qua
      if (drum) gsap.to(".hero__drum", { yPercent: -18, opacity: 0, ease: "none", scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: true } });
    },
    { scope: ref, dependencies: [play, drum] },
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
      {drum && <DongSonDrum className="hero__drum" />}
      <div className="hero__content" style={{ visibility: play ? "visible" : "hidden" }}>
        <Kicker>{beat.kicker}</Kicker>
        <h1 className="hero__title">
          <span className="hero__title-text">{chapter.title}</span>
          <span className="hero__year">{chapter.year}</span>
          <Seal lines={chapter.seal ?? [chapter.title.split(" ")[0], chapter.year]} />
        </h1>
        <p className="hero__lead">{chapter.lead}</p>
        <button type="button" className="hero__scroll" onClick={onStart} disabled={loading}>
          {loading ? "Đang dựng cảnh…" : "Bắt đầu"}
          <span className="hero__line" />
          {!loading && <span className="hero__keys">cuộn, vuốt hoặc phím ↓</span>}
        </button>
      </div>
    </section>
  );
}
