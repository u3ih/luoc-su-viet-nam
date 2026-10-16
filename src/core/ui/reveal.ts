"use client";

import { gsap, SplitText } from "./gsap";

/**
 * Hiệu ứng chữ dùng chung khi một phân cảnh vào khung nhìn:
 * kicker trượt vào, tiêu đề hiện từng chữ từ dưới mặt nạ, thân bài hiện từng dòng.
 * Gọi bên trong useGSAP (để tự dọn khi unmount).
 */
export function revealBeat(section: HTMLElement) {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const trigger = { trigger: section, start: "top 62%", end: "bottom 30%", toggleActions: "play none none reverse" } as const;
    const tl = gsap.timeline({ scrollTrigger: trigger });

    const kicker = section.querySelector(".kicker");
    const band = section.querySelector(".band");
    const title = section.querySelector(".beat__title");
    const bodies = section.querySelectorAll(".beat__body");
    const extras = section.querySelectorAll(".beat__extra");

    if (kicker) tl.from(kicker, { x: -24, opacity: 0, duration: 0.8 }, 0);
    if (title) {
      const split = SplitText.create(title, { type: "words", mask: "words", wordsClass: "sw" });
      tl.from(split.words, { yPercent: 115, duration: 1.2, stagger: 0.07, ease: "expo.out" }, 0.1);
    }
    if (band) tl.from(band, { scaleX: 0, transformOrigin: "left center", duration: 1.4, ease: "expo.inOut" }, 0.2);
    bodies.forEach((p, i) => {
      const split = SplitText.create(p, { type: "lines", mask: "lines", linesClass: "sl" });
      tl.from(split.lines, { yPercent: 100, opacity: 0, duration: 1, stagger: 0.08 }, 0.45 + i * 0.25);
    });
    if (extras.length) tl.from(extras, { y: 24, opacity: 0, duration: 1, stagger: 0.15 }, 0.9);
  });
  return mm;
}
