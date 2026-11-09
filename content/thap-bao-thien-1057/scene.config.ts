import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CHUA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Chùa Báo Thiên (CHUA) phía tây hồ Lục Thủy (HO); sông Hồng phía đông.
// Hoạt cảnh trong từng phân cảnh: người (son) đi lễ về chùa Báo Thiên (đốm vàng) bên hồ; theo thanh kéo, cột đốm vàng (tháp mười hai tầng) cao dần; thợ (son) quanh chân tháp; quân Minh (xanh nhạt) tới; cột đốm vàng (tháp) lịm dần; người (son) đào nền tháp cũ; tám đốm ngà (tượng Kim Cương) hiện ra ở bốn cửa
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "chua": { ...shot([CHUA[0], 0, CHUA[1]], 80, 200, 80, 1), mood: MOOD.dawn + 0.5 },
    "xay-thap": { ...shot([CHUA[0], 0, CHUA[1]], 80, 210, 90, -1), mood: MOOD.sunset + 0.6 },
    "pha-thap": { ...shot([CHUA[0], 0, CHUA[1]], 75, 230, 100, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([CHUA[0], 0, CHUA[1]], 85, 170, 75, -1), mood: MOOD.sunset + 0.55 },
  },
};

export default config;
