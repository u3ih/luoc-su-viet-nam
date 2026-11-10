import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thăng Long (THANG_LONG) đông bắc; Ngọc Lâu (NGOC_LAU) giữa; Trình Quang (TRINH_QUANG) tây.
// Hoạt cảnh trong từng phân cảnh: ba chấm ngà (Duy Mật, Duy Chúc, Duy Quý) ở kinh thành (đốm vàng) — mưu lộ, ba người rời kinh; theo thanh kéo, dân chúng (son) tụ về căn cứ Ngọc Lâu; đốm vàng sáng lên; nghĩa quân (son) chuyển lên núi Trình Quang; 16 đồn luỹ (đốm vàng) sáng quanh núi; ba đạo quân Trịnh (xanh nhạt) kéo tới vây Trình Quang; lửa bùng trong căn cứ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "chinh-bien": { ...shot([170, 0, 230], 70, 230, 110, 1), mood: MOOD.dawn + 0.5 },
    "thanh-hoa": { ...shot([-20, 0, 10], 80, 250, 120, -1), mood: MOOD.sunset + 0.55 },
    "trinh-quang": { ...shot([-180, 0, -40], 180, 260, 150, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([-180, 0, -40], 200, 280, 170, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
