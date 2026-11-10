import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Phố (PHO) ven sông; toà báo (TOA_BAO) giữa.
// Hoạt cảnh trong từng phân cảnh: toà báo (đốm ngà) sáng; người đọc (son) khắp phố tìm đến; hai đốm (ngà: thơ mới; xanh nhạt: thơ cũ) sáng thay nhau; người đọc (son) tụ hai phía; theo thanh kéo, các nhà thơ (đốm vàng) lần lượt sáng lên quanh phố; ánh sáng của các nhà thơ (chấm sáng vàng) tụ về một chỗ (tuyển tập Thi nhân Việt Nam)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "tinh-gia": { ...shot([40, 0, 40], 80, 220, 120, 1), mood: MOOD.dawn + 0.5 },
    "tranh-luan": { ...shot([40, 0, 40], 85, 230, 120, -1), mood: MOOD.sunset + 0.55 },
    "thi-nhan": { ...shot([30, 0, 30], 80, 270, 150, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([40, 0, 40], 75, 240, 130, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
