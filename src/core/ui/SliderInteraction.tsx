"use client";

import { useState } from "react";
import { story } from "../story/store";
import type { SliderInteraction as Spec } from "../types";

/** Thanh kéo tương tác chung: ghi giá trị vào story.inputs[key], báo hoàn thành khi vượt ngưỡng. */
export default function SliderInteraction({ spec, done, onComplete }: { spec: Spec; done: boolean; onComplete: () => void }) {
  const [value, setValue] = useState(0);

  function change(v: number) {
    setValue(v);
    story.inputs[spec.key] = v;
    if (v >= spec.completeAt && !done) {
      story.completedAt[spec.key] ??= performance.now();
      onComplete();
    }
  }

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
        onChange={(e) => change(Number(e.currentTarget.value))}
        aria-label={`${spec.labels[0]} – ${spec.labels[1]}. ${spec.hint}`}
        aria-valuetext={`${pct}%`}
        style={{ "--p": `${pct}%` } as React.CSSProperties}
      />
      {!done && <p className="slider__hint">{spec.hint}</p>}
    </div>
  );
}
