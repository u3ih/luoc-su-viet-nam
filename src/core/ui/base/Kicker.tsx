import type { ReactNode } from "react";

export default function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={`kicker ${className ?? ""}`}>{children}</p>;
}
