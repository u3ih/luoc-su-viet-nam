import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Tiền ngang giữa cảnh; hai tháp cầu (THAP_BAC, THAP_NAM); bờ bắc (BO_BAC), bờ nam (BO_NAM).
// Hoạt cảnh trong từng phân cảnh: những chuyến đò, phà (chấm ngà) qua lại trên sông Tiền; người, xe (son) chờ hai bên bờ; theo thanh kéo, hai tháp (cột đốm vàng) mọc lên, rồi hai nửa nhịp cầu (chuỗi đốm ngà) vươn ra gặp nhau giữa sông; cầu sáng trọn (đốm vàng); xe (chấm xanh nhạt) nối nhau qua cầu; tàu qua gầm cầu; cầu thứ hai (chuỗi đốm ngà) sáng lên phía thượng lưu, song song cầu cũ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,120,-280], look: [0,0,0], mood: MOOD.dawn + 0.3 },
    "du-dinh": { ...shot([30, 0, 0], 35, 190, 70, 1), mood: MOOD.dawn + 0.5 },
    "thi-cong": { ...shot([0, 0, 0], 40, 170, 60, -1), mood: MOOD.sunset + 0.6 },
    "thong-xe": { ...shot([0, 0, 0], 320, 180, 60, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([-30, 0, 0], 40, 210, 80, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
