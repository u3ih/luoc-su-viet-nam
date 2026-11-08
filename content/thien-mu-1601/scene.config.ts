import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HA_KHE } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Hương chảy tây – đông; đồi Hà Khê (HA_KHE) bờ bắc, bến (BEN), Huế (HUE) phía đông.
// Hoạt cảnh trong từng phân cảnh: đốm vàng xa xưa (ngôi chùa cũ) trên đồi; một đốm ngà (bà lão trong truyền thuyết) hiện rồi tắt; đoàn người (son) ngược bờ sông; người (son) từ bến sông lên đồi Hà Khê theo thanh kéo; đốm vàng (chùa mới) sáng dần trên đồi; đốm vàng lớn (Đại Hồng Chung) sáng; nhiều đốm vàng nhỏ (các điện, lầu trùng tu) sáng dần quanh đồi; một cột đốm vàng xếp chồng bảy tầng (tháp Phước Duyên) sáng dần từ dưới lên
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "ha-khe": { ...shot([HA_KHE[0], 0, HA_KHE[1]], 60, 220, 90, 1), mood: MOOD.sunset + 0.7 },
    "khoi-lap": { ...shot([HA_KHE[0], 0, HA_KHE[1]], 80, 200, 90, -1), mood: MOOD.day },
    "hong-chung": { ...shot([HA_KHE[0], 0, HA_KHE[1]], 100, 170, 80, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([HA_KHE[0], 0, HA_KHE[1]], 70, 190, 80, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
