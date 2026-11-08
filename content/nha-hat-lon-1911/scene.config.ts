import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { VUNG_LAY } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Nhà hát (VUNG_LAY) giữa; hồ (HO) phía tây; sông Hồng phía đông.
// Hoạt cảnh trong từng phân cảnh: các đốm xanh nhạt (nước đọng) trên vũng lầy; đốm ngà (bản vẽ) sáng bên cạnh; người (son) đóng cọc, những hàng đốm vàng nhỏ (cọc tre) dày dần trên nền theo thanh kéo; đêm khánh thành: nhiều đốm vàng sáng rực (đèn), người (son) tụ về trước cửa; đèn nhà hát sáng dịu; người (son) qua lại quảng trường
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "do-an": { ...shot([VUNG_LAY[0], 0, VUNG_LAY[1]], 80, 220, 100, 1), mood: MOOD.overcast + 0.4 },
    "dong-coc": { ...shot([VUNG_LAY[0], 0, VUNG_LAY[1]], 80, 150, 60, -1), mood: MOOD.day },
    "khanh-thanh": { ...shot([VUNG_LAY[0], 0, VUNG_LAY[1]], 90, 150, 50, 1), mood: MOOD.sunset + 0.8 },
    "ve-sau": { ...shot([VUNG_LAY[0], 0, VUNG_LAY[1]], 80, 200, 80, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
