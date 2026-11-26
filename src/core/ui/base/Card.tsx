import type { HTMLAttributes, ReactNode } from "react";
import css from "./Card.module.scss";

type Props = HTMLAttributes<HTMLElement> & {
  /** Thẻ HTML ngoài cùng (`li` trong danh sách, `article` cho nội dung độc lập…). */
  as?: "div" | "li" | "article" | "section" | "aside";
  /** `plain`: mặt giấy mờ; `lacquer`: sơn mài nâu ấm — thẻ nổi bật; `veil`: nền tối đặc — đặt trên cảnh 3D. */
  tone?: "plain" | "lacquer" | "veil";
  /** Cả thẻ là một link (đặt `Link` có `data-cover` bên trong để phủ kín thẻ): nổi lên khi rê chuột. */
  interactive?: boolean;
  /** Viền vàng đậm — thẻ hành động chính (vd. "Chương tiếp theo"). */
  accent?: boolean;
  pad?: "sm" | "md" | "lg";
  children: ReactNode;
};

/** Mặt thẻ: bo góc, viền mảnh, nền theo `tone`. Mọi khối "thẻ" (chương, hành trình, ôn tập, ghi chú) dùng chung. */
export default function Card({ as: Tag = "div", tone = "plain", interactive, accent, pad = "md", className, children, ...rest }: Props) {
  const cls = [css.card, css[tone], css[pad], interactive && css.interactive, accent && css.accent, className].filter(Boolean).join(" ");
  return (
    <Tag className={cls} {...rest}>
      {children}
    </Tag>
  );
}
