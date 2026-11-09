import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Quảng Châu (QUANG_CHAU) bắc; Bắc, Trung, Nam Kỳ phía nam; Lao Bảo (LAO_BAO).
// Hoạt cảnh trong từng phân cảnh: các nhà yêu nước (ngà) tụ về Quảng Châu; đốm vàng (hội mới lập); theo thanh kéo, các uỷ viên (chấm ngà) từ Quảng Châu toả về Bắc, Trung, Nam Kỳ; các nơi (đốm ngà) sáng lên; ở Bắc Kỳ, chính quyền bảo hộ (xanh nhạt) truy bắt, xét xử; đốm ngà lịm; tù nhân Lao Bảo (son) phá ngục, chạy vào núi rồi tản mát
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "thanh-lap": { ...shot([0, 0, 310], 90, 220, 120, 1), mood: MOOD.dawn + 0.5 },
    "to-chuc": { ...shot([20, 0, 50], 80, 360, 250, -1), mood: MOOD.sunset + 0.6 },
    "nam-1913": { ...shot([-40, 0, 160], 80, 220, 110, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([-60, 0, 0], 70, 280, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
