import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { LOI_DONG, DO_SON, KINH_BAC, THANG_LONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông; Lôi Động (LOI_DONG) giữa châu thổ, Đồ Sơn (DO_SON) bờ biển, Vân Đồn (VAN_DON) phía đông bắc, Thăng Long (THANG_LONG) phía tây, Kinh Bắc (KINH_BAC) phía bắc, Sơn Nam (SON_NAM) phía nam. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: các nhóm người (son) tụ về Lôi Động, một đốm ngà sáng dần, lửa bật lên; đoàn ngà đi từ Lôi Động ra Đồ Sơn, đốm vàng sáng ở Đồ Sơn; đốm ngà lan dần từ Đồ Sơn sang Vân Đồn, Kinh Bắc, Thăng Long, Sơn Nam theo thanh kéo; một đoàn đi từ Đồ Sơn tới Thăng Long, đốm ngà mờ dần, đốm vàng sáng ở Thăng Long
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,190,-300], look: [30,0,20], mood: MOOD.dawn + 0.3 },
    "quan-he": { ...shot([LOI_DONG[0], 0, LOI_DONG[1]], 20, 220, 110, 1), mood: MOOD.day },
    "nguyen-cu": { ...shot([DO_SON[0], 0, DO_SON[1]], 100, 230, 120, -1), mood: MOOD.overcast + 0.2 },
    "do-son": { ...shot([KINH_BAC[0], 0, KINH_BAC[1]], 90, 300, 170, 1), mood: MOOD.overcast + 0.5 },
    "bi-bat": { ...shot([THANG_LONG[0], 0, THANG_LONG[1]], 200, 240, 120, -1), mood: MOOD.sunset },
  },
};

export default config;
