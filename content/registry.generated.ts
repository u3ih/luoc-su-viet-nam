// Tự sinh bởi scripts/gen-content.mjs — ĐỪNG sửa tay. Chạy `pnpm content` để cập nhật.
import type { SceneConfig } from "@/core/types";
import type { SceneSetup } from "@/core/engine/world";

export type ChapterEntry = {
  dir: string;
  config: () => Promise<{ default: SceneConfig }>;
  scene: () => Promise<{ default: SceneSetup }>;
};

/** Các chương, xếp theo thời gian. */
export const registry: Record<string, ChapterEntry> = {
  "nui-do": {
    dir: "nui-do",
    config: () => import("./nui-do/scene.config"),
    scene: () => import("./nui-do/scene"),
  },
  "son-vi": {
    dir: "son-vi",
    config: () => import("./son-vi/scene.config"),
    scene: () => import("./son-vi/scene"),
  },
  "con-moong": {
    dir: "con-moong",
    config: () => import("./con-moong/scene.config"),
    scene: () => import("./con-moong/scene"),
  },
  "hoa-binh": {
    dir: "hoa-binh",
    config: () => import("./hoa-binh/scene.config"),
    scene: () => import("./hoa-binh/scene"),
  },
  "bac-son": {
    dir: "bac-son",
    config: () => import("./bac-son/scene.config"),
    scene: () => import("./bac-son/scene"),
  },
  "quynh-van": {
    dir: "quynh-van",
    config: () => import("./quynh-van/scene.config"),
    scene: () => import("./quynh-van/scene"),
  },
  "phung-nguyen": {
    dir: "phung-nguyen",
    config: () => import("./phung-nguyen/scene.config"),
    scene: () => import("./phung-nguyen/scene"),
  },
  "dong-dau": {
    dir: "dong-dau",
    config: () => import("./dong-dau/scene.config"),
    scene: () => import("./dong-dau/scene"),
  },
  "con-rong-chau-tien": {
    dir: "con-rong-chau-tien",
    config: () => import("./con-rong-chau-tien/scene.config"),
    scene: () => import("./con-rong-chau-tien/scene"),
  },
  "dong-son": {
    dir: "dong-son",
    config: () => import("./dong-son/scene.config"),
    scene: () => import("./dong-son/scene"),
  },
  "co-loa": {
    dir: "co-loa",
    config: () => import("./co-loa/scene.config"),
    scene: () => import("./co-loa/scene"),
  },
  "hai-ba-trung-40": {
    dir: "hai-ba-trung-40",
    config: () => import("./hai-ba-trung-40/scene.config"),
    scene: () => import("./hai-ba-trung-40/scene"),
  },
  "van-xuan-544": {
    dir: "van-xuan-544",
    config: () => import("./van-xuan-544/scene.config"),
    scene: () => import("./van-xuan-544/scene"),
  },
  "bach-dang-938": {
    dir: "bach-dang-938",
    config: () => import("./bach-dang-938/scene.config"),
    scene: () => import("./bach-dang-938/scene"),
  },
  "dai-co-viet-968": {
    dir: "dai-co-viet-968",
    config: () => import("./dai-co-viet-968/scene.config"),
    scene: () => import("./dai-co-viet-968/scene"),
  },
  "chong-tong-981": {
    dir: "chong-tong-981",
    config: () => import("./chong-tong-981/scene.config"),
    scene: () => import("./chong-tong-981/scene"),
  },
  "doi-do-1010": {
    dir: "doi-do-1010",
    config: () => import("./doi-do-1010/scene.config"),
    scene: () => import("./doi-do-1010/scene"),
  },
  "nhu-nguyet-1077": {
    dir: "nhu-nguyet-1077",
    config: () => import("./nhu-nguyet-1077/scene.config"),
    scene: () => import("./nhu-nguyet-1077/scene"),
  },
  "dien-hong-1284": {
    dir: "dien-hong-1284",
    config: () => import("./dien-hong-1284/scene.config"),
    scene: () => import("./dien-hong-1284/scene"),
  },
  "bach-dang-1288": {
    dir: "bach-dang-1288",
    config: () => import("./bach-dang-1288/scene.config"),
    scene: () => import("./bach-dang-1288/scene"),
  },
};
