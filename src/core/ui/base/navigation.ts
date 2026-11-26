"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { irisClose } from "./iris";

/** Chuyển trang bằng code (vd. tự sang chương sau) với cùng màn khép điện ảnh như `Link`; màn mở lại khi trang cũ gỡ. */
export function useNavigate() {
  const router = useRouter();
  const release = useRef<(() => void) | null>(null);
  useEffect(() => () => release.current?.(), []);
  return useCallback(
    (href: string) => {
      release.current?.();
      release.current = irisClose(window.innerWidth / 2, window.innerHeight / 2);
      router.push(href);
    },
    [router],
  );
}
