// Tự sinh bởi scripts/gen-content.mjs — ĐỪNG sửa tay. Chạy `pnpm content` để cập nhật.
import type { SceneConfig } from "@/core/types";
import type { SceneSetup } from "@/core/engine/world";

export type ChapterEntry = {
  dir: string;
  config: () => Promise<{ default: SceneConfig }>;
  scene: () => Promise<{ default: SceneSetup }>;
};

export const registry: Record<string, ChapterEntry> = {
  "bach-dang-938": {
    dir: "01-bach-dang-938",
    config: () => import("./01-bach-dang-938/scene.config"),
    scene: () => import("./01-bach-dang-938/scene"),
  },
};
