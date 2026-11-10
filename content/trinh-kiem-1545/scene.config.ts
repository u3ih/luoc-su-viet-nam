import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Ai Lao (AI_LAO) tây; Vạn Lại (VAN_LAI); Tây Đô (TAY_DO); Thăng Long (THANG_LONG) bắc; Thuận Hóa (THUAN_HOA) nam.
// Hoạt cảnh trong từng phân cảnh: quân Nam triều (son) từ Ai Lao kéo về Thanh Hóa; đốm ngà (Nguyễn Kim) và một chấm ngà (Trịnh Kiểm) theo sau; thành Tây Đô (đốm vàng) sáng lên; đốm ngà (Nguyễn Kim) tắt; đốm vàng (Trịnh Kiểm) sáng lên; quân Mạc (xanh nhạt) đánh úp từ phía bắc rồi tan ở bờ sông; theo thanh kéo, hào kiệt các xứ phía nam (son) kéo về Vạn Lại; dải đốm xanh nhạt phía bắc (Bắc triều), đốm ngà phía nam (Nam triều); Nguyễn Hoàng (chấm ngà) rời Thanh Hóa vào Thuận Hóa; đốm vàng ở Vạn Lại lịm dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "nguyen-kim": { ...shot([-180, 0, -40], 60, 270, 150, 1), mood: MOOD.dawn + 0.5 },
    "nam-1545": { ...shot([-60, 0, -30], 75, 270, 150, -1), mood: MOOD.sunset + 0.55 },
    "nam-bac": { ...shot([-40, 0, -60], 85, 270, 150, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([0, 0, -200], 290, 270, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
