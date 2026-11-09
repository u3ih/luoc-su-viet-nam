import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Dãy Hải Vân ngang giữa cảnh; Huế (HUE) bắc, Đà Nẵng (DA_NANG) nam; cửa hầm bắc (CUA_BAC), nam (CUA_NAM).
// Hoạt cảnh trong từng phân cảnh: xe (chấm ngà) chậm chạp bò qua con đèo quanh co vắt qua núi; theo thanh kéo, hai cửa hầm (đốm vàng) sáng, rồi đường hầm (chuỗi đốm vàng) xuyên núi từ hai đầu gặp nhau; công nhân (son) ở hai cửa; đường hầm sáng trọn (đốm vàng); xe (xanh nhạt) nối nhau qua hầm; hầm thứ hai (chuỗi đốm ngà) sáng song song bên cạnh hầm cũ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,180,-320], look: [0,0,0], mood: MOOD.dawn + 0.3 },
    "deo": { ...shot([60, 0, 0], 60, 330, 190, 1), mood: MOOD.dawn + 0.5 },
    "dao-ham": { ...shot([-40, 0, 0], 80, 300, 170, -1), mood: MOOD.sunset + 0.65 },
    "khanh-thanh": { ...shot([-40, 0, 0], 70, 300, 180, 1), mood: MOOD.sunset + 0.75 },
    "ve-sau": { ...shot([-30, 0, 0], 90, 300, 180, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
