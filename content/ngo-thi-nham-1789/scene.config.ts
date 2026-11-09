import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thăng Long (THANG_LONG) bắc; Tả Thanh Oai (TA_THANH_OAI); phòng tuyến Tam Điệp (TAM_DIEP) nam.
// Hoạt cảnh trong từng phân cảnh: làng Tả Thanh Oai (đốm ngà); chấm ngà (Ngô Thì Nhậm) lên kinh thành rồi rời kinh về phía nam lánh mình; theo thanh kéo, quân Tây Sơn (son) rời Thăng Long lui về Tam Điệp; quân Thanh (xanh nhạt) từ phía bắc vào kinh thành; sứ bộ (chấm ngà) rời Thăng Long lên phía bắc; thư từ bang giao (đốm vàng) qua lại; thiền viện (đốm vàng) ở chốn yên tĩnh; một chấm ngà
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,300], look: [20,0,-20], mood: MOOD.dawn + 0.3 },
    "ta-thanh-oai": { ...shot([-120, 0, 140], 80, 200, 90, 1), mood: MOOD.dawn + 0.5 },
    "tam-diep": { ...shot([20, 0, 30], 260, 340, 210, -1), mood: MOOD.sunset + 0.55 },
    "bang-giao": { ...shot([80, 0, 260], 80, 240, 120, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([-60, 0, 100], 80, 280, 140, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
