import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Vân Trung (VAN_TRUNG) tây bắc; Cao Bằng, Lạng Sơn đông; Tuyên Quang nam; rừng Thẩm Pát đông nam.
// Hoạt cảnh trong từng phân cảnh: các thành tỉnh (đốm xanh nhạt) có lưu quan; dân các châu (son) trong núi; theo thanh kéo, thổ mục và dân chúng (son) từ các châu tụ về Vân Trung; đốm vàng sáng lên; quân nổi dậy (son) vây Cao Bằng, Lạng Sơn; ba đạo quân triều (xanh nhạt) từ ba phía tiến về Vân Trung; một nhóm nhỏ (son) lui vào rừng Thẩm Pát; quân triều (xanh nhạt) vây; lửa đốt rừng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "luu-quan": { ...shot([30, 0, 30], 80, 320, 180, 1), mood: MOOD.dawn + 0.5 },
    "van-trung": { ...shot([-150, 0, 180], 80, 230, 110, -1), mood: MOOD.sunset + 0.55 },
    "ba-mat": { ...shot([20, 0, 60], 80, 330, 190, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([100, 0, -200], 40, 240, 120, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
