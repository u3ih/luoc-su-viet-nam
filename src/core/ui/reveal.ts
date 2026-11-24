"use client";

import { gsap, SplitText } from "./gsap";

/** Hiệu ứng vào khung của một phân cảnh. Gọi trong useGSAP để tự dọn. */
export function revealBeat(section: HTMLElement) {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const trigger = { trigger: section, start: "top 62%", end: "bottom 30%", toggleActions: "play none none reverse" } as const;
    const tl = gsap.timeline({ scrollTrigger: trigger });

    const card = section.querySelector<HTMLElement>(".beat__card");
    const kicker = section.querySelector(".kicker");
    const band = section.querySelector(".band");
    const title = section.querySelector(".beat__title");
    const bodies = section.querySelectorAll(".beat__body");
    const extras = section.querySelectorAll(".beat__extra");

    if (card) {
      const side = section.classList.contains("beat--right") ? 1 : section.classList.contains("beat--center") ? 0 : -1;
      tl.from(
        card,
        side
          ? { rotateY: side * 16, z: -140, transformPerspective: 1400, transformOrigin: side > 0 ? "100% 50%" : "0% 50%", opacity: 0, duration: 1.6, ease: "expo.out" }
          : { rotateX: 14, z: -140, transformPerspective: 1400, transformOrigin: "50% 100%", opacity: 0, duration: 1.6, ease: "expo.out" },
        0,
      );
    }
    if (kicker) tl.from(kicker, { x: -24, opacity: 0, duration: 0.8 }, 0);
    if (title) {
      const split = SplitText.create(title, { type: "words", mask: "words", wordsClass: "sw" });
      tl.from(split.words, { yPercent: 115, rotateX: -80, transformPerspective: 500, transformOrigin: "50% 100%", duration: 1.3, stagger: 0.07, ease: "expo.out" }, 0.1);
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
