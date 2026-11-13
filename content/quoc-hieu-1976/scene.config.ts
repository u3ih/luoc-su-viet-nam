import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (HA_NOI) bắc; Sài Gòn (SAI_GON) nam; miền Trung (MIEN_TRUNG) giữa.
// Hoạt cảnh trong từng phân cảnh: hai đốm lớn — ngà ở bắc, xanh nhạt ở nam — hai chính quyền; người (son) đi lại hai miền; theo thanh kéo, điểm bỏ phiếu (đốm vàng) hai miền sáng dần; các đại biểu (ngà) hai miền tụ về Hà Nội (đốm vàng lớn); ruộng đồng, nhà máy (đốm ngà) chỉ sáng lờ mờ; ánh lửa ở biên giới phía bắc và tây nam (1979)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "hai-mien": { ...shot([40, 0, 0], 75, 280, 170, 1), mood: MOOD.overcast + 0.6 },
    "bau-cu": { ...shot([40, 0, 0], 85, 290, 170, -1), mood: MOOD.sunset + 0.6 },
    "ten-nuoc": { ...shot([60, 0, 250], 90, 160, 70, 1), mood: MOOD.day },
    "ve-sau": { ...shot([40, 0, 0], 80, 260, 150, -1), mood: MOOD.overcast + 0.6 },
  },
};

export default config;
