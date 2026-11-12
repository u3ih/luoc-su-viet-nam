import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kourou (KOUROU) đông; trạm thu (TRAM) tây.
// Hoạt cảnh trong từng phân cảnh: trạm thu mặt đất (đốm vàng) và các kỹ sư (son) ở Việt Nam; đốm ngà (vệ tinh đang chế tạo) ở xa; đốm ngà (vệ tinh trong công-ten-nơ) được chở tới bãi phóng; một đốm xanh nhạt (mây xấu) che rồi tan; theo thanh kéo, cột đốm vàng (tên lửa Vega) bay lên từ bãi phóng Kourou, đưa vệ tinh lên cao; vệ tinh (đốm vàng trên cao) bay ngang trời; vùng ảnh chụp (vòng đốm xanh nhạt) quét qua mặt đất, dữ liệu về trạm thu
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "du-an": { ...shot([-150, 0, 60], 70, 210, 110, 1), mood: MOOD.dawn + 0.5 },
    "kourou": { ...shot([60, 0, -20], 80, 240, 120, -1), mood: MOOD.sunset + 0.6 },
    "phong": { ...shot([150, 0, -40], 80, 230, 30, 1), mood: MOOD.sunset + 0.85 },
    "anh-ve-tinh": { ...shot([-60, 0, 20], 75, 260, 130, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
