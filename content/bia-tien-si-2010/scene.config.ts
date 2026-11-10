import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Văn Miếu (VAN_MIEU) giữa, trục chính hướng bắc.
// Hoạt cảnh trong từng phân cảnh: bảy đốm vàng (bảy tấm bia đầu tiên) sáng ở đầu hai hàng; các đợt dựng bia: hai hàng đốm ngà dài thêm theo thời gian; theo thanh kéo, hai hàng 41 đốm vàng (82 tấm bia) lần lượt sáng; hai hàng bia (đốm vàng) sáng đều; khách thăm (son) đi dọc trục giữa
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "nam-1484": { ...shot([0, 0, 40], 80, 200, 120, 1), mood: MOOD.dawn + 0.5 },
    "dung-bia": { ...shot([0, 0, 40], 85, 180, 110, -1), mood: MOOD.sunset + 0.6 },
    "hang-bia": { ...shot([0, 0, 30], 90, 160, 100, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([0, 0, 0], 85, 200, 110, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
