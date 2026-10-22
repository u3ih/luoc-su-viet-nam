import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { GATE, gatePoint, QUARRY } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thành Tây Đô ở gốc (gần vuông, nửa cạnh 120 m, bốn cửa), sông Mã phía nam (z ≈ -240),
// sông Bưởi phía tây, núi An Tôn phía tây bắc (mỏ đá QUARRY). Mọi vị trí là gợi ý.
// built: mức dựng tường 0..1 (người xem kéo ở phân cảnh "xay-thanh"); wear: độ mòn của thành (như ngày nay).
// Hoạt cảnh trong từng phân cảnh (thuyền Chiêm Thành ngược sông, người khiêng đá, đoàn rước vào thành, sứ giả ra các làng,
// quân Minh tiến xuống, quân Hồ rút về nam, khách tham quan) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const south = gatePoint(GATE.nam, 0);

const config: SceneConfig = {
  params: { built: 0, wear: 0 },
  keyframes: {
    "mo-dau": { cam: [330, 120, -330], look: [-20, 10, 20], mood: MOOD.dawn },
    "cuoi-tran": { ...shot([130, 0, -190], 80, 400, 230, 1, 0.2), mood: MOOD.overcast + 0.4 },
    "xay-thanh": { ...shot([(QUARRY[0] - 60) / 2, 4, (QUARRY[1] + 90) / 2], 35, 320, 160, -1), mood: MOOD.day, params: { built: 0 } },
    "doi-do": { ...shot([0, 4, 40], 240, 360, 200, 1, 0.2), mood: MOOD.sunset - 0.3, params: { built: 1 } },
    "cai-cach": { ...shot([0, 0, 0], 100, 380, 250, -1, 0.2), mood: MOOD.day },
    "quan-minh": { ...shot([0, 0, 220], 90, 400, 210, 1, 0.2), mood: MOOD.overcast },
    "that-thu": { ...shot([0, 0, -20], 270, 400, 230, -1, 0.2), mood: MOOD.sunset + 0.3 },
    "di-san": { ...shot([south[0], 6, south[1]], 95, 190, 55, 1), mood: MOOD.day, params: { wear: 0.35 } },
  },
};

export default config;
