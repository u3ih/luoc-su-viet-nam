"use client";

import css from "./Segmented.module.scss";

type Props<T extends string> = {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

/** Nút chọn một trong vài kiểu (vd. Thẻ / Dòng thời gian): một khối bo tròn, mục đang chọn tô vàng. */
export default function Segmented<T extends string>({ label, options, value, onChange, className }: Props<T>) {
  return (
    <div className={`${css.group} ${className ?? ""}`} role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
