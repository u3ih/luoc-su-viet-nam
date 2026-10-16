import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ: sông chảy dọc trục z, biển ở z âm, thượng nguồn z dương; bãi cọc quanh z ∈ [-40, -8].
// Tham số không ghi sẽ giữ giá trị của phân cảnh trước.

export const TIDE_HIGH = 1.4;
export const TIDE_LOW = -2.6;

const config: SceneConfig = {
  params: { tide: 0, built: 0, fleet: 0, lure: 0, attack: 0, sink: 0 },
  keyframes: {
    "mo-dau": { cam: [-46, 40, -196], look: [0, 2, -30], mood: MOOD.dawn },
    "nghin-nam": { cam: [96, 104, 128], look: [10, 0, -30], mood: MOOD.dawn },
    "nam-937": { cam: [104, 34, 6], look: [40, 4, 56], mood: MOOD.dawn + 0.3 },
    "nam-han": { cam: [26, 15, -84], look: [0, 3, -200], mood: MOOD.overcast, params: { fleet: 0.4 } },
    "bai-coc": { cam: [33, 5.5, -46], look: [0, -1.4, -24], mood: MOOD.overcast, params: { tide: TIDE_LOW, built: 1 } },
    "trieu-len": { cam: [-34, 17, -82], look: [0, 0, -24], mood: MOOD.overcast, params: { tide: TIDE_HIGH, fleet: 1, lure: 1 } },
    "nuoc-rut": { cam: [46, 13, -66], look: [-12, -0.6, -40], mood: MOOD.overcast },
    "ket-cuc": { cam: [-62, 44, -104], look: [0, 0, -20], mood: MOOD.sunset, params: { tide: TIDE_LOW, attack: 1, sink: 1 } },
    "xung-vuong": { cam: [-30, 70, -40], look: [10, 0, 70], mood: MOOD.sunset + 0.5 },
    "dau-vet": { cam: [0, 96, -170], look: [0, 0, 0], mood: MOOD.sunset + 0.6 },
  },
};

export default config;
