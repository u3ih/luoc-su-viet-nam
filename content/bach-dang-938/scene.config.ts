import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ: sông chảy dọc trục z, biển ở z âm, thượng nguồn z dương; bãi cọc quanh z ∈ [-40, -8].
// Tham số không ghi sẽ giữ giá trị của phân cảnh trước.
// Hoạt cảnh trong từng phân cảnh (đoàn quân, đoàn thuyền, lửa…) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Khung hình: chữ ở bên phải với phân cảnh chẵn, bên trái với phân cảnh lẻ → chủ thể đặt ở nửa còn lại.

export const TIDE_HIGH = 1.4;
export const TIDE_LOW = -2.6;

const config: SceneConfig = {
  params: { tide: 0, built: 0, fleet: 0, lure: 0, attack: 0, sink: 0 },
  keyframes: {
    "mo-dau": { cam: [-46, 40, -196], look: [0, 2, -30], mood: MOOD.dawn },
    "nghin-nam": { cam: [96, 104, 128], look: [10, 0, -30], mood: MOOD.dawn },
    "nam-937": { cam: [70, 60, 170], look: [8, 0, 45], focus: [-70, 0, 80], mood: MOOD.dawn + 0.3 },
    "nam-han": { cam: [-90, 50, 0], look: [-60, 0, -170], focus: [-20, 0, -130], mood: MOOD.overcast, params: { fleet: 0.4 } },
    "bai-coc": { cam: [-45, 26, -92], look: [-18, -1, -6], focus: [0, -1, -24], mood: MOOD.overcast, params: { tide: TIDE_LOW, built: 1 } },
    "trieu-len": { cam: [70, 50, -215], look: [42, 0, -40], focus: [0, 0, -50], mood: MOOD.overcast, fov: 40, params: { tide: TIDE_HIGH, fleet: 1, lure: 1 } },
    "nuoc-rut": { cam: [46, 13, -66], look: [-12, -0.6, -40], mood: MOOD.overcast },
    "ket-cuc": { cam: [-85, 52, 20], look: [-28, 0, -85], focus: [-4, 0, -50], mood: MOOD.sunset, params: { tide: TIDE_LOW, attack: 1, sink: 1 } },
    "xung-vuong": { cam: [-30, 70, -40], look: [-22, 0, 85], focus: [30, 0, 90], mood: MOOD.sunset + 0.5 },
    "dau-vet": { cam: [30, 96, -170], look: [55, 0, 0], focus: [2, 0, -22], mood: MOOD.sunset + 0.6 },
  },
};

export default config;
