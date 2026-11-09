import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Bờ Vũng Tàu (VUNG_TAU) phía tây; giàn MSP-1 (MSP1) giữa biển.
// Hoạt cảnh trong từng phân cảnh: tàu khảo sát (chấm xanh nhạt) chạy trên biển; giếng thăm dò (đốm xanh nhạt) nhấp nháy; theo thanh kéo, giàn MSP-1 (cột đốm vàng) sáng dần từ mặt nước lên; ngọn đuốc khí cháy; tàu chở dầu (chấm ngà) cập giàn; thêm các giàn khác (cột đốm vàng) quanh mỏ; khí đuốc cháy; đường ống khí (chuỗi đốm ngà) từ mỏ vào bờ Vũng Tàu; bờ sáng đèn (đốm vàng)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-340,120,-200], look: [80,0,40], mood: MOOD.dawn + 0.3 },
    "tham-do": { ...shot([60, 0, 20], 75, 260, 110, 1), mood: MOOD.dawn + 0.5 },
    "dong-dau": { ...shot([80, 0, 40], 80, 180, 70, -1), mood: MOOD.sunset + 0.7 },
    "da-mong": { ...shot([100, 0, 50], 70, 280, 130, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([-100, 0, 0], 60, 330, 170, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
