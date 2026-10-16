import type * as THREE from "three";
import type { MoodState } from "../world/sky";
import type { Quality } from "./quality";

export type FrameCtx = {
  time: number;
  dt: number;
  /** performance.now() */
  now: number;
  /** Vị trí liên tục theo phân cảnh. */
  t: number;
  /** Tham số chương đã nội suy + giảm chấn. */
  params: Record<string, number>;
  /** Giá trị tương tác (đã làm mượt). */
  inputs: Record<string, number>;
  completedAt: Record<string, number>;
  camera: THREE.PerspectiveCamera;
  /** Hệ số kích thước điểm ảnh (dpr × chiều cao) cho hiệu ứng hạt. */
  pixelScale: number;
};

/** Một thành phần của cảnh: có thể có object 3D, cập nhật mỗi frame, tự dọn dẹp. */
export interface Actor {
  object?: THREE.Object3D;
  update?(ctx: FrameCtx): void;
  dispose?(): void;
}

/** Thứ engine trao cho script dựng cảnh của từng chương. */
export type World = {
  scene: THREE.Scene;
  quality: Quality;
  /** Bầu trời + ánh sáng hiện tại (đọc mỗi frame). */
  mood: MoodState;
  add<A extends Actor>(actor: A): A;
  /**
   * Chỉnh tham số mục tiêu mỗi frame, sau khi nội suy keyframe và trước khi giảm chấn.
   * Dùng cho logic riêng của chương (vd. người xem điều khiển thủy triều).
   */
  resolve(fn: (target: Record<string, number>, ctx: FrameCtx) => void): void;
  /** Phát tín hiệu cho UI / âm thanh (vd. "battle"). */
  signal(name: string, value: number): void;
  /** Chỉ số phân cảnh theo id trong story.md (để so với ctx.t). */
  beat(id: string): number;
  /** Bật bóng đổ cho object nếu thiết bị đủ mạnh. */
  castShadow(o: THREE.Object3D, receive?: boolean): void;
  /**
   * Nhường main thread một nhịp. Gọi giữa các bước dựng cảnh nặng (rải cây, nướng model…) để màn mở đầu
   * vẫn chạy mượt thay vì đứng hình cả giây trên điện thoại.
   */
  yield(): Promise<void>;
};

export type SceneSetup = (world: World) => Promise<void> | void;
