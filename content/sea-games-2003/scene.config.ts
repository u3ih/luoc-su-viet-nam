import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Mỹ Đình (MY_DINH) giữa; đền Hùng (DEN_HUNG) tây bắc; phương nam (PHUONG_NAM).
// Hoạt cảnh trong từng phân cảnh: vòng đốm ngà (sân vận động) dựng dần; người (son) làm việc quanh sân; đốm vàng (ngọn lửa) sáng ở đền Hùng; ngọn đuốc (chấm vàng) đi từ phương nam qua nhiều nơi ra sân Mỹ Đình; theo thanh kéo, đoàn vận động viên các nước (chấm người nhiều màu) lần lượt tiến vào sân; cột đốm vàng (huy chương) cao dần giữa sân; cổ động viên (son) quanh sân
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "chuan-bi": { ...shot([0, 0, 40], 80, 210, 120, 1), mood: MOOD.dawn + 0.5 },
    "ruoc-duoc": { ...shot([-80, 0, 40], 80, 270, 160, -1), mood: MOOD.sunset + 0.55 },
    "khai-mac": { ...shot([0, 0, 40], 85, 190, 120, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([0, 0, 40], 80, 210, 130, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
