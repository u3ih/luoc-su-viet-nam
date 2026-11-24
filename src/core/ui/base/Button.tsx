import type { ComponentProps, ReactNode } from "react";
import Link from "./Link";

type Common = { variant?: "primary" | "default"; className?: string; children: ReactNode };
type AsLink = Common & Omit<ComponentProps<typeof Link>, "className" | "children">;
type AsButton = Common & Omit<ComponentProps<"button">, "className" | "children"> & { href?: undefined };

export default function Button({ variant = "default", className, ...props }: AsLink | AsButton) {
  const cls = `btn ${variant === "primary" ? "btn--primary" : ""} ${className ?? ""}`;
  if (props.href !== undefined) return <Link {...(props as AsLink)} className={cls} />;
  return <button type="button" {...(props as AsButton)} className={cls} />;
}
