import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Tống Bình (TONG_BINH) giữa; các làng (LANG_A) quanh.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (trị sở Tống Bình) sáng bên sông; các làng (đốm ngà) quanh; theo thanh kéo, các toán thu thuế (xanh nhạt) từ trị sở toả về các làng; ở các làng, người dân (son) tụ lại; đoàn người (son) từ các làng kéo về vây trị sở Tống Bình; lửa ở trị sở; đoàn quân (xanh nhạt) từ phương bắc theo sông xuống; các đốm son tắt dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "an-nam": { ...shot([30, 0, 40], 90, 200, 110, 1), mood: MOOD.dawn + 0.5 },
    "thue": { ...shot([-20, 0, 0], 80, 230, 130, -1), mood: MOOD.overcast + 0.6 },
    "tong-binh": { ...shot([40, 0, 40], 70, 170, 90, 1), mood: MOOD.sunset + 0.7 },
    "bi-dep": { ...shot([20, 0, 20], 110, 220, 120, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
