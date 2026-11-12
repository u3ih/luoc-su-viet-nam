import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hòn Lao (HON_LAO) giữa; Cửa Đại (CUA_DAI) tây.
// Hoạt cảnh trong từng phân cảnh: tám hòn đảo lần lượt sáng (đốm ngà); thuyền (chấm ngà) từ Cửa Đại ra đảo; các dấu tích nhiều thời (đốm xanh nhạt Sa Huỳnh, đốm vàng Chămpa, đốm ngà Đại Việt) sáng trên đảo lớn; theo thanh kéo, các rạn san hô (vòng đốm xanh nhạt, vàng) lần lượt hiện quanh các đảo; đốm vàng lớn (khu dự trữ sinh quyển) sáng giữa quần đảo; các đảo cùng sáng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "tam-hon": { ...shot([60, 0, 0], 80, 270, 150, 1), mood: MOOD.dawn + 0.5 },
    "champello": { ...shot([30, 0, 0], 75, 230, 150, -1), mood: MOOD.sunset + 0.6 },
    "san-ho": { ...shot([60, 0, -20], 80, 220, 120, 1), mood: MOOD.sunset + 0.65 },
    "jeju": { ...shot([20, 0, 0], 85, 270, 160, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
