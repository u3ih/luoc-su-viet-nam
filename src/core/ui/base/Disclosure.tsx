import type { ReactNode } from "react";
import css from "./Disclosure.module.scss";

/** Mục thu gọn (`<details>`): nội dung vẫn có trong HTML để tìm kiếm và đọc màn hình, chỉ ẩn bớt cho gọn. */
export default function Disclosure({ summary, children, className, open }: { summary: ReactNode; children: ReactNode; className?: string; open?: boolean }) {
  return (
    <details className={`${css.details} ${className ?? ""}`} open={open}>
      <summary className={css.summary}>{summary}</summary>
      <div className={css.body}>{children}</div>
    </details>
  );
}
