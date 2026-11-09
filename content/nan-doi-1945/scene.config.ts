import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Các làng (LANG_*) giữa đồng; kho thóc (KHO); thị xã (THI_XA) đông bắc.
// Hoạt cảnh trong từng phân cảnh: thóc từ các làng (son) bị gom về kho (đốm xanh nhạt); ruộng lúa (đốm vàng nhỏ) lụi dần; dân các làng (son) đứng giữa đồng; theo thanh kéo, ánh lửa các làng (đốm ngà) tắt dần; người đói (son) lê bước về phía thị xã; nơi phát chẩn, ruộng tăng gia (đốm vàng) sáng dần; người (son) trở lại đồng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "nguyen-nhan": { ...shot([20, 0, 40], 75, 300, 170, 1), mood: MOOD.dawn + 0.5 },
    "mat-mua": { ...shot([-60, 0, -40], 80, 260, 130, -1), mood: MOOD.dawn + 0.55 },
    "nan-doi": { ...shot([0, 0, 20], 75, 300, 170, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([-40, 0, 0], 80, 280, 150, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
