import type { ComponentProps, ReactNode } from "react";
import css from "./Field.module.scss";

/** Ô nhập có nhãn phía trên (năm, tỉnh…). `control` là `input` hoặc `select` dựng sẵn qua `Input` / `Select`. */
export default function Field({ label, htmlFor, children, className }: { label: ReactNode; htmlFor: string; children: ReactNode; className?: string }) {
  return (
    <div className={`${css.field} ${className ?? ""}`}>
      <label htmlFor={htmlFor} className={css.label}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={`${css.control} ${className ?? ""}`} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={`${css.control} ${css.select} ${className ?? ""}`} {...props} />;
}
