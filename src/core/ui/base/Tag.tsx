import type { ReactNode } from "react";
import css from "./Tag.module.scss";

/** Nhãn nhỏ cạnh chữ: "truyền thuyết", "diễn ý", "đã xem"… — không bấm được. */
export default function Tag({ children, tone = "muted", className }: { children: ReactNode; tone?: "muted" | "gold" | "son"; className?: string }) {
  return <span className={`${css.tag} ${css[tone]} ${className ?? ""}`}>{children}</span>;
}
