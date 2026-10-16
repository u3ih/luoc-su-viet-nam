"use client";

import { clearProgress, ratio } from "../story/progress";
import { useProgress } from "./hooks/useProgress";
import css from "./ReadProgress.module.scss";

/** Nhãn tiến độ của một chương: "Đã xem" / "Đang xem · 40%" kèm vạch tiến độ. Chưa xem thì không hiện gì. */
export function ReadBadge({ slug, className }: { slug: string; className?: string }) {
  const p = useProgress()[slug];
  if (!p) return null;
  const pct = Math.round(ratio(p) * 100);
  return (
    <span className={`${css.badge} ${p.done ? css.done : ""} ${className ?? ""}`} style={{ "--p": `${pct}%` } as React.CSSProperties}>
      {p.done ? "✓ Đã xem" : `Đang xem · ${pct}%`}
    </span>
  );
}

/** Tổng kết: đã xem hết bao nhiêu chương trên tổng số. */
export function ReadSummary({ slugs }: { slugs: string[] }) {
  const all = useProgress();
  const done = slugs.filter((s) => all[s]?.done).length;
  const started = slugs.filter((s) => all[s] && !all[s].done).length;
  if (!done && !started) return <p className={css.summary}>Tiến độ xem được lưu ngay trên trình duyệt của bạn.</p>;
  return (
    <p className={css.summary}>
      <span className={css.bar} style={{ "--p": `${Math.round((done / Math.max(1, slugs.length)) * 100)}%` } as React.CSSProperties} aria-hidden="true" />
      Bạn đã xem hết <strong>{done}</strong> / {slugs.length} chương{started ? `, đang xem dở ${started} chương` : ""}.{" "}
      <button type="button" className={css.reset} onClick={clearProgress}>
        Xoá tiến độ
      </button>
    </p>
  );
}
