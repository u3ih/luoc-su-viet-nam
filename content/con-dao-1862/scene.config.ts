import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Nhà tù (NHA_TU_CD) giữa; Hàng Dương (HANG_DUONG) đông; biển quanh đảo.
// Hoạt cảnh trong từng phân cảnh: thuyền (xanh nhạt) chở tù (son) từ đất liền ra đảo; tường nhà tù đứng giữa thị trấn; nhiều nhóm tù (son) trong tường; các đốm ngà (những người tù nổi tiếng) lần lượt sáng; theo thanh kéo, một nhóm khách (xanh nhạt) rời lối đi chính, rẽ qua con hẻm giữa hai dãy nhà tù tới khu biệt giam (đốm vàng); những người tù (son) ra khỏi tường; nhiều đốm vàng nhỏ (những ngôi mộ) sáng ở nghĩa trang Hàng Dương
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "lap-nha-tu": { ...shot([0, 0, -30], 90, 190, 110, 1), mood: MOOD.overcast + 0.6 },
    "tu-nhan": { ...shot([0, 0, -30], 60, 150, 80, -1), mood: MOOD.sunset + 0.7 },
    "chuong-cop": { ...shot([0, 0, -20], 110, 140, 70, 1), mood: MOOD.day },
    "hang-duong": { ...shot([70, 0, -60], 80, 170, 80, -1), mood: MOOD.dawn + 0.6 },
  },
};

export default config;
