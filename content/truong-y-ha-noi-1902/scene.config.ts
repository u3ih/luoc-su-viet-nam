import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Trường (TRUONG) giữa; Việt Bắc (VIET_BAC) tây bắc; khoảng trống (MAT) đông.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (trường) sáng; đốm ngà (hiệu trưởng) tới; những sinh viên đầu tiên (son) tụ về; theo thanh kéo, từng lớp tốt nghiệp (hàng đốm ngà) sáng dần thành khối lớn (237 người đến năm 1914); thầy trò (son, ngà) rời Hà Nội lên chiến khu Việt Bắc; lớp học (đốm vàng) sáng giữa núi rừng; trường (đốm vàng) sáng lại ở Hà Nội; nhiều thế hệ bác sĩ (son) toả đi khắp nơi
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "thanh-lap": { ...shot([-20, 0, 40], 80, 200, 100, 1), mood: MOOD.dawn + 0.5 },
    "y-duoc": { ...shot([60, 0, 50], 85, 200, 100, -1), mood: MOOD.sunset + 0.65 },
    "chien-khu": { ...shot([-150, 0, 160], 60, 230, 120, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([-20, 0, 40], 80, 210, 110, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
