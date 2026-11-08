import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { THUNG_LUNG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hai dãy núi đá vôi, thung lũng (THUNG_LUNG) giữa; hang (HANG) sườn núi.
// Hoạt cảnh trong từng phân cảnh: đốm vàng mờ (lửa của người xưa) trong hang sườn núi; vài chấm người (son) quanh hang; theo thanh kéo, vòng đốm vàng (ranh giới khu rừng cấm) khép dần quanh hai dãy núi; các đốm vàng cao (ngọn chò nghìn năm) nhô trên tán rừng thung lũng; đàn chim (chấm ngà) bay; những chấm sáng nhỏ (voọc, thú rừng) di chuyển dưới tán rừng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "nui-da-voi": { ...shot([THUNG_LUNG[0], 0, THUNG_LUNG[1]], 110, 300, 170, 1), mood: MOOD.dawn + 0.5 },
    "thanh-lap": { ...shot([THUNG_LUNG[0], 0, THUNG_LUNG[1]], 100, 360, 210, -1), mood: MOOD.day },
    "rung-gia": { ...shot([THUNG_LUNG[0], 0, THUNG_LUNG[1]], 120, 200, 90, 1), mood: MOOD.sunset + 0.45 },
    "ve-sau": { ...shot([THUNG_LUNG[0], 0, THUNG_LUNG[1]], 100, 220, 110, -1), mood: MOOD.sunset + 0.55 },
  },
};

export default config;
