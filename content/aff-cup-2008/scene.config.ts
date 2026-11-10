import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Phuket (PHUKET) tây nam; Singapore (SINGAPORE) nam; Băng Cốc (BANG_COC) tây; Mỹ Đình (MY_DINH) bắc.
// Hoạt cảnh trong từng phân cảnh: đội tuyển (chấm son) tới Phuket; ba trận vòng bảng (ba đốm sáng lần lượt); lượt đi ở Mỹ Đình, lượt về ở Singapore (đốm vàng khi thắng); theo thanh kéo, khán đài sân Mỹ Đình (vòng đốm ngà) bừng sáng dần; đốm vàng giữa sân khi trận đấu khép lại; người hâm mộ (son) từ khắp nơi đổ về; đốm vàng giữa sân
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "vong-bang": { ...shot([-200, 0, -140], 70, 220, 130, 1), mood: MOOD.dawn + 0.5 },
    "ban-ket": { ...shot([60, 0, -20], 80, 270, 160, -1), mood: MOOD.sunset + 0.55 },
    "chung-ket": { ...shot([80, 0, 170], 80, 200, 120, 1), mood: MOOD.sunset + 0.75 },
    "ve-sau": { ...shot([60, 0, 140], 75, 250, 140, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
