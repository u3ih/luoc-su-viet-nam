"use client";

import { useMemo, useSyncExternalStore } from "react";
import { subscribeProgress, type Progress } from "../../story/progress";

const read = () => {
  try {
    return window.localStorage.getItem("lsvn-progress") ?? "{}";
  } catch {
    return "{}";
  }
};

/** Tiến độ xem các chương trên máy này. Lúc render phía server / lần hydrate đầu luôn rỗng. */
export function useProgress(): Progress {
  const raw = useSyncExternalStore(subscribeProgress, read, () => "{}");
  return useMemo(() => {
    try {
      return JSON.parse(raw) as Progress;
    } catch {
      return {};
    }
  }, [raw]);
}
