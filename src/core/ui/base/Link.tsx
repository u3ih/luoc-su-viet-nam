"use client";

import NextLink from "next/link";
import { useEffect, useRef, type ComponentProps } from "react";
import { irisClose } from "./iris";

type Props = ComponentProps<typeof NextLink> & { iris?: boolean };

export default function Link({ iris = true, onClick, href, rel, ...props }: Props) {
  const release = useRef<(() => void) | null>(null);
  useEffect(() => () => release.current?.(), []);

  if (typeof href === "string" && /^(https?:|mailto:|#)/.test(href)) {
    const { prefetch: _p, replace: _r, scroll: _s, ...rest } = props;
    const external = !href.startsWith("#");
    return (
      <a
        {...rest}
        href={href}
        onClick={onClick}
        target={external ? "_blank" : undefined}
        rel={external ? `noopener noreferrer${rel ? ` ${rel}` : ""}` : rel}
      />
    );
  }
  return (
    <NextLink
      {...props}
      href={href}
      rel={rel}
      onClick={(e) => {
        onClick?.(e);
        if (!iris || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        // cùng trang thì trang không gỡ, màn khép sẽ che tới hết hạn
        if (new URL(e.currentTarget.href).pathname === window.location.pathname) return;
        const kb = e.detail === 0;
        release.current?.();
        release.current = irisClose(kb ? window.innerWidth / 2 : e.clientX, kb ? window.innerHeight / 2 : e.clientY);
      }}
    />
  );
}
