import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { THIEN_MAC } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông chảy tây bắc – đông nam; Thăng Long (THANG_LONG) bắc, bãi Thiên Mạc (THIEN_MAC) giữa, Thiên Trường (THIEN_TRUONG) nam.
// Hoạt cảnh trong từng phân cảnh: đoàn quân, đoàn thuyền nhà Trần (son, ngà) rời Thăng Long xuôi về Thiên Trường; một toán (ngà) dừng lại ở bãi Thiên Mạc; thuyền nhẹ, kỵ binh Nguyên (xanh nhạt) đuổi xuống; quân Trần (son) giữ bãi Thiên Mạc chặn lại theo thanh kéo; lửa bùng trên bãi; đốm ngà (Trần Bình Trọng) giữa vòng quân Nguyên (xanh nhạt), sáng rồi lịm dần; trời rạng; đốm vàng sáng ở bãi Thiên Mạc; đoàn thuyền (ngà) đã về đến Thiên Trường an toàn
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "rut-lui": { ...shot([0, 0, 0], 60, 340, 170, 1), mood: MOOD.overcast + 0.4 },
    "thien-mac": { ...shot([THIEN_MAC[0], 0, THIEN_MAC[1]], 70, 230, 110, -1), mood: MOOD.sunset + 0.4 },
    "khang-khai": { ...shot([THIEN_MAC[0], 0, THIEN_MAC[1]], 110, 200, 90, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([60, 0, -60], 70, 300, 150, -1), mood: MOOD.dawn + 0.4 },
  },
};

export default config;
