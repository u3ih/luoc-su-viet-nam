import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (HA_NOI) tây nam; Paris (PARIS) bắc; Hyderabad (HYDERABAD) đông nam.
// Hoạt cảnh trong từng phân cảnh: Hà Nội (đốm ngà); cậu bé (chấm ngà) đi học; hai huy chương vàng (đốm vàng); chấm ngà đi từ Hà Nội tới Paris; công trình (cột đốm vàng) cao dần; theo thanh kéo, các nhà toán học (xanh nhạt) từ khắp nơi tụ về Hyderabad; chấm ngà từ Paris tới; đốm vàng (huy chương) sáng lên; Viện Nghiên cứu cao cấp về Toán ở Hà Nội (đốm vàng); học trò (son) tụ về
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "ha-noi": { ...shot([-220, 0, -180], 80, 190, 90, 1), mood: MOOD.dawn + 0.5 },
    "paris": { ...shot([-40, 0, 60], 70, 340, 220, -1), mood: MOOD.sunset + 0.6 },
    "fields": { ...shot([150, 0, -120], 30, 260, 140, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([-160, 0, -170], 50, 260, 130, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
