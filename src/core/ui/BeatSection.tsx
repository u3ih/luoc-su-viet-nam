"use client";

import { useRef } from "react";
import type { Beat } from "../types";
import { useGSAP } from "./gsap";
import DongSonBand from "./ornaments/DongSonBand";
import { revealBeat } from "./reveal";
import SliderInteraction from "./SliderInteraction";

type Props = {
  beat: Beat;
  index: number;
  sectionRef: (el: HTMLElement | null) => void;
  completed: boolean;
  onComplete: () => void;
  /** Chế độ tự cuộn: máy tự kéo thanh tương tác giúp người xem. */
  autoPlay?: boolean;
  /** Nội dung thêm cuối phân cảnh (vd. phần kết chương). */
  children?: React.ReactNode;
};

/** Một phân cảnh chữ — bố cục trái/phải/giữa, ghi chú, trích dẫn, tương tác. */
export default function BeatSection({ beat, index, sectionRef, completed, onComplete, autoPlay, children }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  useGSAP(() => {
    if (ref.current) revealBeat(ref.current);
  });

  const layout = beat.layout ?? (index % 2 === 0 ? "right" : "left");
  return (
    <section
      ref={(el) => {
        ref.current = el;
        sectionRef(el);
      }}
      className={`beat beat--${layout} ${beat.interaction ? "beat--interactive" : ""}`}
      data-beat={beat.id}
    >
      <article className="beat__card">
        <span className="beat__corner beat__corner--tl" aria-hidden="true" />
        <span className="beat__corner beat__corner--br" aria-hidden="true" />
        <p className="kicker">{beat.kicker}</p>
        <h2 className="beat__title">{beat.title}</h2>
        <DongSonBand className="band" />
        {beat.body.map((p, k) => (
          <p key={k} className="beat__body">
            {p}
          </p>
        ))}

        {beat.quote && (
          <figure className="quote beat__extra">
            <blockquote>{beat.quote.paraphrase ? beat.quote.text : `“${beat.quote.text}”`}</blockquote>
            <figcaption>
              — {beat.quote.cite}
              {beat.quote.paraphrase && <span className="quote__tag">diễn ý</span>}
            </figcaption>
          </figure>
        )}

        {beat.note && (
          <aside className="note beat__extra">
            <p className="note__title">{beat.note.title}</p>
            <p>{beat.note.text}</p>
          </aside>
        )}

        {beat.interaction && (
          <div className="beat__extra">
            <SliderInteraction spec={beat.interaction} done={completed} onComplete={onComplete} autoPlay={autoPlay} />
            <p className={`beat__won ${completed ? "is-shown" : ""}`} aria-live="polite">
              {completed ? beat.interaction.completeText : ""}
            </p>
          </div>
        )}
        {children}
      </article>
    </section>
  );
}
