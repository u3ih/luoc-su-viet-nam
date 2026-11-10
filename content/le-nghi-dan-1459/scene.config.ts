import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hoàng thành (CUNG) giữa; Lệ Chi viên (LE_CHI) đông; phủ Lạng Sơn vương (PHU_LS) tây bắc.
// Hoạt cảnh trong từng phân cảnh: đốm ngà (Nghi Dân) trong cung mờ đi và dời ra phủ riêng phía tây bắc; đốm vàng (Bang Cơ) sáng lên giữa cung; đêm, quân của Nghi Dân (xanh nhạt) từ phủ riêng chia ba đường vào cung; đốm vàng tắt; theo thanh kéo, sáu bộ (sáu đốm ngà) lần lượt được lập trong cung; các đại thần (son) tụ ở cửa rồi vào cung; quân thân tín (xanh nhạt) ngã; đốm vàng (Lê Tư Thành) sáng lên
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "thai-tu": { ...shot([20, 0, 40], 80, 250, 140, 1), mood: MOOD.dawn + 0.5 },
    "dien-ninh": { ...shot([-40, 0, 80], 60, 270, 150, -1), mood: MOOD.sunset + 0.75 },
    "sau-bo": { ...shot([20, 0, 40], 85, 200, 110, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([20, 0, 20], 80, 260, 140, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
