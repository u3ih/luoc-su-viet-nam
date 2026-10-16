"use client";

import { useEffect, useRef } from "react";
import { registry } from "@content/registry.generated";
import { createEngine } from "../engine/Engine";
import type { SceneConfig } from "../types";

type Props = { slug: string; ids: string[]; config: SceneConfig; onReady: () => void; onFail: () => void };

/** Canvas 3D của một chương: tạo engine + nạp script dựng cảnh của chương từ registry. */
export default function SceneStage({ slug, ids, config, onReady, onFail }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const entry = registry[slug];
    if (!canvas || !entry) return;
    let engine: ReturnType<typeof createEngine> | undefined;
    try {
      engine = createEngine(canvas, {
        ids,
        keyframes: ids.map((id) => config.keyframes[id]),
        params: config.params,
        setup: async (world) => (await entry.scene()).default(world),
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
        onReady,
      });
    } catch (err) {
      console.warn("[scene] WebGL không khả dụng", err);
      onFail();
    }
    return () => engine?.dispose();
    // engine chỉ tạo một lần mỗi lần mount
  }, []);

  return <canvas ref={ref} className="stage__canvas" aria-hidden="true" />;
}
