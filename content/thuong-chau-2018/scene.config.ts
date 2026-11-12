import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sân (SAN) giữa; Nội Bài (NOI_BAI) tây nam; Hà Nội (HA_NOI) tây bắc.
// Hoạt cảnh trong từng phân cảnh: ba trận vòng bảng (đốm xanh nhạt thua, vàng thắng, ngà hoà) sáng lần lượt; khán đài (son) quanh sân; hai loạt luân lưu: hàng đốm vàng (quả thành công) và một đốm xanh nhạt (quả bị cản) sáng lần lượt; theo thanh kéo, quả bóng (chấm vàng) vẽ đường cong từ chấm đá phạt vào góc cao khung thành (vòng đốm ngà) giữa màn tuyết; xe đón đội (chấm vàng) đi chậm từ Nội Bài về Hà Nội giữa biển người (son) hai bên đường
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "vong-bang": { ...shot([60, 0, 0], 80, 220, 120, 1), mood: MOOD.dawn + 0.5 },
    "luan-luu": { ...shot([60, 0, 0], 90, 180, 90, -1), mood: MOOD.sunset + 0.7 },
    "chung-ket": { ...shot([60, 0, 0], 90, 160, 70, 1), mood: MOOD.dawn + 0.6 },
    "don-doi": { ...shot([-250, 0, 0], 80, 260, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
