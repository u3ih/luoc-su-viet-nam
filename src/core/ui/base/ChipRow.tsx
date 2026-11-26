import { Children, type ReactNode } from "react";
import css from "./ChipRow.module.scss";

/**
 * Một hàng `Chip` (lọc thời kỳ, nhảy tới nơi…). Màn rộng: xuống dòng khi `wrap`, không thì cuộn ngang;
 * điện thoại: luôn một hàng cuộn ngang sát hai mép màn hình.
 */
export default function ChipRow({ label, children, wrap, className }: { label: string; children: ReactNode; wrap?: boolean; className?: string }) {
  return (
    <ul className={`${css.row} ${wrap ? css.wrap : ""} ${className ?? ""}`} aria-label={label}>
      {Children.map(children, (c) => c && <li>{c}</li>)}
    </ul>
  );
}
