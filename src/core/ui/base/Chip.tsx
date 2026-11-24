import type { ComponentProps, ReactNode } from "react";
import Icon, { type IconName } from "./Icon";
import Link from "./Link";

type Common = {
  icon?: IconName;
  children: ReactNode;
  on?: boolean;
  ghost?: boolean;
  className?: string;
};
type AsLink = Common & Omit<ComponentProps<typeof Link>, "className" | "children">;
type AsButton = Common & Omit<ComponentProps<"button">, "className" | "children"> & { href?: undefined };

export default function Chip({ icon, children, on, ghost, className, ...props }: AsLink | AsButton) {
  const cls = `chip ${on ? "chip--on" : ""} ${ghost ? "chip--ghost" : ""} ${className ?? ""}`;
  // nhãn bị ẩn trên điện thoại khi có icon
  const label = typeof children === "string" ? children : undefined;
  const body = (
    <>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </>
  );
  if (props.href !== undefined)
    return (
      <Link aria-label={label} {...(props as AsLink)} className={cls}>
        {body}
      </Link>
    );
  return (
    <button type="button" aria-label={label} aria-pressed={on} {...(props as AsButton)} className={cls}>
      {body}
    </button>
  );
}
