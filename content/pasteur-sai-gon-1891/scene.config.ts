import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Viện (VIEN) giữa; sông Sài Gòn đông; Paris (PARIS) tây bắc.
// Hoạt cảnh trong từng phân cảnh: đốm ngà (Calmette) rời Paris sang Sài Gòn; đốm vàng (viện) sáng ở Sài Gòn, các phòng thí nghiệm (lưới đốm ngà) quanh; theo thanh kéo, những liều vắc-xin (chấm vàng) từ viện toả đi các tỉnh Nam Kỳ (đốm ngà); vùng phụ trách của viện (20 đốm từ Lâm Đồng tới Cà Mau) sáng; người dân (son) đến tiêm chủng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "calmette": { ...shot([-120, 0, 140], 50, 270, 150, 1), mood: MOOD.dawn + 0.5 },
    "thanh-lap": { ...shot([0, 0, 20], 80, 180, 100, -1), mood: MOOD.sunset + 0.6 },
    "vac-xin": { ...shot([0, 0, 0], 80, 250, 140, 1), mood: MOOD.sunset + 0.65 },
    "ngay-nay": { ...shot([0, 0, 0], 85, 270, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
