import type { ComponentProps, ReactNode } from "react";
import Link from "./Link";

type Common = {
  /** `primary`: nền son — mỗi vùng màn hình chỉ một nút này; `default`: viền mảnh; `quiet`: chỉ chữ, cho hành động phụ. */
  variant?: "primary" | "default" | "quiet";
  size?: "md" | "sm";
  /** Rộng hết khung chứa (nút chính trên điện thoại). */
  block?: boolean;
  className?: string;
  children: ReactNode;
};
type AsLink = Common & Omit<ComponentProps<typeof Link>, "className" | "children">;
type AsButton = Common & Omit<ComponentProps<"button">, "className" | "children"> & { href?: undefined };

export default function Button({ variant = "default", size = "md", block, className, ...props }: AsLink | AsButton) {
  const cls = ["btn", variant !== "default" && `btn--${variant}`, size === "sm" && "btn--sm", block && "btn--block", className].filter(Boolean).join(" ");
  if (props.href !== undefined) return <Link {...(props as AsLink)} className={cls} />;
  return <button type="button" {...(props as AsButton)} className={cls} />;
}
