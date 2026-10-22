import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { STAKE_X, TL, riverZ } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): sông lớn chảy từ tây sang đông ra biển (x tăng dần là hướng ra biển); Thăng Long ở bờ bắc phía tây (TL), bãi cọc trên sông ở x ≈ 112,
// hai lạch nhỏ phía bắc và phía nam đổ vào sông chính gần khu cọc. Mọi vị trí là gợi ý.
// tide: 0 = triều lên (cọc chìm), 1 = triều rút (cọc nhô lên); người xem kéo ở phân cảnh "con-nuoc".
// Hoạt cảnh trong từng phân cảnh (quân Nguyên vào Thăng Long, đánh úp đoàn thuyền lương, quân Nguyên rút theo hai đường, bãi cọc trồi lên, giả thua nhử rồi phục kích khi
// triều rút, thu quân và quân Nguyên rút bộ bị chặn đánh, các điểm dấu tích hiện dần) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: { tide: 0.1 },
  keyframes: {
    "mo-dau": { cam: [300, 100, -250], look: [60, 0, -20], mood: MOOD.dawn, params: { tide: 0.1 } },
    "quan-nguyen": { ...shot([TL[0] + 40, 0, TL[1] + 40], 60, 330, 200, 1, 0.2), mood: MOOD.overcast },
    "van-don": { ...shot([300, 0, -50], 190, 230, 110, -1, 0.25), mood: MOOD.overcast + 0.4 },
    "nguyen-rut": { ...shot([-150, 0, 100], 20, 380, 220, 1, 0.2), mood: MOOD.overcast - 0.2 },
    "coc-ngam": { ...shot([STAKE_X, 0, riverZ(STAKE_X)], 250, 120, 45, -1), mood: MOOD.day - 0.3, params: { tide: 0.7 } },
    "con-nuoc": { ...shot([60, 0, riverZ(60)], 190, 170, 52, 1), mood: MOOD.day - 0.5, params: { tide: 0 } },
    "ket-qua": { ...shot([40, 0, 50], 80, 400, 230, -1, 0.2), mood: MOOD.sunset, params: { tide: 0.7 } },
    "dau-tich": { ...shot([STAKE_X, 0, riverZ(STAKE_X)], 270, 270, 150, 1, 0.25), mood: MOOD.day - 0.2, params: { tide: 1 } },
  },
};

export default config;
