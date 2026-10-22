import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { BASES, HL } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): Hoa Lư ở (-220, -160) giữa các dãy núi đá vôi; đồng bằng trải về phía đông bắc, có mười hai cứ điểm
// (BASES, vị trí gợi ý), sông lớn chảy dọc phía đông (x ≈ 180).
// Hoạt cảnh trong từng phân cảnh (cứ điểm hiện dần và các nhóm quân xô xát, người tụ về Hoa Lư, đoàn trẻ chăn trâu bày trận,
// đoàn quân đi qua các cứ điểm, lễ lên ngôi, vạc dầu và sứ đoàn, ánh sáng Hoa Lư tắt dần) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const mid = [(BASES[0][0] + BASES[6][0]) / 2, 0, (BASES[0][1] + BASES[6][1]) / 2] as [number, number, number];

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [150, 120, -330], look: [-170, 25, -130], mood: MOOD.dawn },
    loan: { ...shot(mid, 80, 300, 200, 1, 0.2), mood: MOOD.overcast },
    "hoa-lu": { ...shot([HL[0], 8, HL[1]], 40, 150, 55, -1), mood: MOOD.dawn + 0.6 },
    "co-lau": { ...shot([HL[0] + 70, 3, HL[1] + 90], 200, 85, 30, 1), mood: MOOD.day - 0.3, fov: 48 },
    "dep-loan": { ...shot([-30, 0, 30], 55, 300, 210, -1, 0.2), mood: MOOD.overcast + 0.3 },
    "xung-de": { ...shot([HL[0], 8, HL[1]], 320, 120, 36, 1), mood: MOOD.sunset },
    "trieu-dinh": { ...shot([HL[0] + 10, 8, HL[1] + 5], 150, 100, 40, -1), mood: MOOD.day - 0.5 },
    ket: { ...shot([HL[0], 8, HL[1]], 250, 190, 90, 1), mood: MOOD.night - 0.3 },
  },
};

export default config;
