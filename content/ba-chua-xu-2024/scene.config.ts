import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Núi Sam giữa cảnh; bệ thờ (BE_THO) trên đỉnh; miếu (MIEU) chân núi phía đông nam.
// Hoạt cảnh trong từng phân cảnh: pho tượng trên đỉnh núi Sam (đốm vàng); dân quanh vùng (son) nhìn lên; theo thanh kéo, đoàn rước (chín chấm ngà) cùng kiệu (đốm vàng) từ đỉnh núi xuống chân núi; miếu (đốm vàng) sáng lên; khách hành hương (son) từ bốn phía về miếu; múa lân, nhạc ngũ âm (đốm ngà) quanh sân miếu; bốn cộng đồng (son, ngà, xanh nhạt, vàng) cùng dự lễ quanh miếu
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "pho-tuong": { ...shot([0, 0, 60], 80, 230, 130, 1), mood: MOOD.dawn + 0.5 },
    "ruoc-tuong": { ...shot([40, 0, 20], 70, 230, 110, -1), mood: MOOD.sunset + 0.6 },
    "le-hoi": { ...shot([90, 0, -40], 80, 220, 100, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([60, 0, -20], 75, 320, 170, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
