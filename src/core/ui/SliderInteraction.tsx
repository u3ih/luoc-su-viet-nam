"use client";

import { useEffect, useRef, useState } from "react";
import { story } from "../story/store";
import type { SliderInteraction as Spec } from "../types";
import { gsap } from "./gsap";

type Props = {
  spec: Spec;
  done: boolean;
  onComplete: () => void;
  /** Máy tự kéo thanh (chế độ tự cuộn khi nghe kể). Người xem chạm vào thanh thì máy thôi kéo. */
  autoPlay?: boolean;
};

/** Thanh kéo tương tác chung: ghi giá trị vào story.inputs[key], báo hoàn thành khi vượt ngưỡng. */
export default function SliderInteraction({ spec, done, onComplete, autoPlay }: Props) {
  const [value, setValue] = useState(0);
  const tween = useRef<gsap.core.Tween | null>(null);

  function change(v: number) {
    setValue(v);
    story.inputs[spec.key] = v;
    if (v >= spec.completeAt && !done) {
      story.completedAt[spec.key] ??= performance.now();
      onComplete();
    }
  }
  const changeRef = useRef(change);
  useEffect(() => {
    changeRef.current = change;
  });

  useEffect(() => {
    // không phụ thuộc `done`: vượt ngưỡng rồi vẫn kéo nốt tới cuối cho cảnh diễn trọn
    if (!autoPlay) return;
    const state = { v: story.inputs[spec.key] ?? 0 };
    tween.current = gsap.to(state, { v: 1, duration: 4.5, ease: "power1.inOut", onUpdate: () => changeRef.current(Math.round(state.v * 100) / 100) });
    return () => {
      tween.current?.kill();
      tween.current = null;
    };
  }, [autoPlay, spec.key]);

  const pct = Math.round(value * 100);
  return (
    <div className={`slider ${done ? "slider--done" : ""}`}>
      <div className="slider__labels" aria-hidden="true">
        <span>{spec.labels[0]}</span>
        <span>{spec.labels[1]}</span>
      </div>
      <input
        className="slider__range"
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onPointerDown={() => tween.current?.kill()}
        onChange={(e) => change(Number(e.currentTarget.value))}
        aria-label={`${spec.labels[0]} – ${spec.labels[1]}. ${spec.hint}`}
        aria-valuetext={`${pct}%`}
        style={{ "--p": `${pct}%` } as React.CSSProperties}
      />
      {!done && <p className="slider__hint">{autoPlay ? "Đang kéo giúp bạn…" : spec.hint}</p>}
    </div>
  );
}
