import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Bản (BAN) giữa thung lũng; sân xòe (SAN); núi bao quanh.
// Hoạt cảnh trong từng phân cảnh: người Thái (son) theo các ngả núi xuống thung lũng, dựng bản (đốm ngà); các điệu xòe: vòng đốm ngà nhỏ (khăn, nón, quạt) quanh sân; tiếng trống, chiêng (đốm vàng); theo thanh kéo, vòng xòe (chấm người son) nối dài quanh đống lửa giữa sân; các bản quanh thung lũng (đốm vàng) lần lượt sáng; vòng xòe vẫn quanh lửa
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "nguon-goc": { ...shot([0, 0, 120], 80, 260, 140, 1), mood: MOOD.dawn + 0.5 },
    "dieu-xoe": { ...shot([0, 0, 60], 85, 160, 80, -1), mood: MOOD.sunset + 0.6 },
    "vong-xoe": { ...shot([0, 0, 60], 85, 140, 80, 1), mood: MOOD.sunset + 0.75 },
    "ve-sau": { ...shot([0, 0, 40], 80, 270, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
