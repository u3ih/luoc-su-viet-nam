"use client";

import css from "./Iris.module.scss";

/** Trả về `release`: gọi khi trang cũ đã gỡ để màn mờ đi. */
export function irisClose(x: number, y: number): () => void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  const el = document.createElement("div");
  el.className = css.iris;
  el.setAttribute("aria-hidden", "true");
  const drum = document.createElement("div");
  drum.className = `dong-son-drum ${css.drum}`;
  el.append(drum);
  document.body.append(el);

  const closing = el.animate([{ clipPath: `circle(0% at ${x}px ${y}px)` }, { clipPath: `circle(150% at ${x}px ${y}px)` }], {
    duration: 750,
    easing: "cubic-bezier(0.65, 0, 0.35, 1)",
    fill: "forwards",
  });
  drum.animate([{ opacity: 0, transform: "scale(1.6) rotate(-30deg)" }, { opacity: 0.55, transform: "none" }], {
    duration: 1100,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    fill: "forwards",
  });

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    clearTimeout(fallback);
    void closing.finished
      .catch(() => {})
      .then(() => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: "ease-out", fill: "forwards" }).finished)
      .catch(() => {})
      .then(() => el.remove());
  };
  const fallback = setTimeout(release, 6000);
  return release;
}
