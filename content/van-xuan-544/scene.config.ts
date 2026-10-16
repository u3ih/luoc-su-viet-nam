import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ: đầm Dạ Trạch quanh gốc, bãi giữa đầm ở (-20, 10), trại quân Lương trên bờ đông (x ≈ 260). Xem terrain.ts.
// camp: lửa trại giặc (0..1); raid: thuyền độc mộc đánh úp (tự diễn sau khi người xem kéo cho đêm xuống).
// Ở phân cảnh "da-trach", người xem kéo thanh để trời chuyển từ ngày sang đêm (scene.ts chỉnh mood).

const config: SceneConfig = {
  params: { camp: 0.25, raid: 0 },
  keyframes: {
    "mo-dau": { cam: [-170, 30, -210], look: [0, 2, 0], mood: MOOD.dawn },
    "nha-luong": { cam: [230, 150, -230], look: [0, 0, 40], mood: MOOD.overcast },
    "khoi-nghia": { cam: [-80, 22, 100], look: [40, 2, -20], mood: MOOD.overcast + 0.6 },
    "van-xuan": { cam: [10, 64, -160], look: [-10, 8, 50], mood: MOOD.sunset },
    "phan-cong": { cam: [320, 40, 150], look: [240, 4, 10], mood: MOOD.overcast + 0.4, params: { camp: 0.5 } },
    "da-trach": { cam: [10, 11, -34], look: [150, 2, 18], mood: MOOD.overcast },
    "long-bien": { cam: [150, 46, -120], look: [250, 4, 20], mood: MOOD.night + 0.65, params: { camp: 1, raid: 1 } },
    "tu-chu": { cam: [0, 170, -270], look: [0, 0, 30], mood: MOOD.day, params: { camp: 0 } },
    "mong-rong": { cam: [-100, 24, -50], look: [-20, 4, 10], mood: MOOD.day, params: { raid: 0 } },
  },
};

export default config;
