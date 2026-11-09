import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Lam phía bắc; sân làng (SAN); ruộng (RUONG) phía nam.
// Hoạt cảnh trong từng phân cảnh: phường cấy (son) trên ruộng; phường vải (ngà) trong làng; theo thanh kéo, hai phường hát (son, ngà) kéo về hai bên sân làng đối đáp; trăng (đốm vàng) lên; hai nhóm đứng đối diện hát giặm; tiếng hát xen kẽ (đốm ngà, đốm son nhấp nháy); đò (chấm ngà) trên sông Lam — ví đò đưa; trăng (đốm vàng)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "doi-thuong": { ...shot([0, 0, -90], 80, 260, 120, 1), mood: MOOD.dawn + 0.5 },
    "hat-vi": { ...shot([-20, 0, 30], 80, 190, 70, -1), mood: MOOD.sunset + 0.75 },
    "hat-giam": { ...shot([-40, 0, 40], 70, 200, 80, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([0, 0, 140], 80, 260, 110, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
