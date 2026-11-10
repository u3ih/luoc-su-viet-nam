import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thăng Long (THANG_LONG) bắc; Thanh Hóa (THANH_HOA) tây nam; bờ bắc sông Nhị (BO_BAC).
// Hoạt cảnh trong từng phân cảnh: quân Mạc (xanh nhạt) từ phía bắc đánh vào Thanh Hóa rồi lui; quân Nam triều (son) giữ quanh doanh trại (đốm ngà); quân Lê – Trịnh (son) từ Thanh Hóa tiến ra Thăng Long; quân Mạc (xanh nhạt) lui qua sông về bờ bắc; theo thanh kéo, phủ chúa (cột đốm ngà) dựng lên cạnh cung vua (đốm vàng); trăm quan (chấm ngà) về phủ chúa; lửa cháy trong kinh thành; dân (son) tản ra; đốm ngà ở phủ chúa vẫn sáng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "nam-trieu": { ...shot([-150, 0, -200], 250, 260, 150, 1), mood: MOOD.dawn + 0.5 },
    "thang-long": { ...shot([40, 0, 60], 60, 270, 150, -1), mood: MOOD.sunset + 0.55 },
    "binh-an-vuong": { ...shot([140, 0, 150], 80, 220, 120, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([120, 0, 150], 70, 260, 150, -1), mood: MOOD.sunset + 0.75 },
  },
};

export default config;
