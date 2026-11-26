import type { ReactNode } from "react";
import css from "./SectionHead.module.scss";
import Kicker from "./Kicker";

type Props = {
  title: ReactNode;
  kicker?: ReactNode;
  lead?: ReactNode;
  /** Nút / link bên phải tiêu đề (màn rộng), xuống dưới lời dẫn trên điện thoại. */
  action?: ReactNode;
  /** Cấp tiêu đề: 1 cho đầu trang, 2 cho mục, 3 cho mục con. */
  level?: 1 | 2 | 3;
  id?: string;
  className?: string;
};

/** Đầu mục thống nhất: dòng nhãn nhỏ → tiêu đề serif → lời dẫn mờ, (tuỳ chọn) hành động bên phải. */
export default function SectionHead({ title, kicker, lead, action, level = 2, id, className }: Props) {
  const H = `h${level}` as const;
  return (
    <header className={`${css.head} ${css[`l${level}`]} ${className ?? ""}`}>
      <div className={css.text}>
        {kicker && <Kicker>{kicker}</Kicker>}
        <H id={id} className={css.title}>
          {title}
        </H>
        {lead && <p className={css.lead}>{lead}</p>}
      </div>
      {action && <div className={css.action}>{action}</div>}
    </header>
  );
}
