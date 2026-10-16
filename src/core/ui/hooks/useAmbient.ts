"use client";

import { useEffect, useRef, useState } from "react";
import { createAmbient } from "../../audio/ambient";
import { story } from "../../story/store";

/** Âm thanh nền; chỉ khởi tạo khi người dùng bấm (trình duyệt yêu cầu thao tác). */
export function useAmbient() {
  const ref = useRef<ReturnType<typeof createAmbient> | null>(null);
  const [on, setOn] = useState(false);
  useEffect(() => () => ref.current?.dispose(), []);
  return {
    on,
    toggle() {
      ref.current ??= createAmbient(() => story.signals.battle ?? 0);
      ref.current.setVolume(on ? 0 : 0.7);
      setOn(!on);
    },
  };
}
