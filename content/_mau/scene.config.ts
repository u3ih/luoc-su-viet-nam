import { MOOD, type SceneConfig } from "@/core/types";

// Mỗi id trong story.md cần đúng một keyframe ở đây.
// cam = vị trí máy quay, look = điểm nhìn; mood = bầu trời (xem MOOD).
// params: tham số riêng của chương, scene.ts đọc qua ctx.params.<tên>.

const config: SceneConfig = {
  params: { level: 0 },
  keyframes: {
    "mo-dau": { cam: [-40, 36, -120], look: [0, 2, 0], mood: MOOD.dawn },
    "boi-canh": { cam: [50, 22, -30], look: [0, 0, 20], mood: MOOD.day },
    ket: { cam: [0, 80, -140], look: [0, 0, 0], mood: MOOD.sunset, params: { level: 1 } },
  },
};

export default config;
