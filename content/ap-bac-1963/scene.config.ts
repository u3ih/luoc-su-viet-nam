import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Ấp Bắc (AP_BAC) giữa; Tân Thới (TAN_THOI) bắc; Tân Hiệp (TAN_HIEP) đông.
// Hoạt cảnh trong từng phân cảnh: đốm vàng nhỏ (đài vô tuyến) ở Tân Thới; ba cánh quân (xanh nhạt) từ ba hướng tiến lại; hàng công sự (son) dọc bờ kênh dưới hàng cây; tiểu đoàn bảo an (xanh nhạt) tiến từ phía nam bị chặn cách bờ kênh vài chục mét; theo thanh kéo, mười lăm trực thăng (đốm xanh nhạt, cách điệu) bay từ Tân Hiệp tới, đổ quân xuống ruộng trước công sự; lửa ở năm chỗ; đêm, quân Giải phóng (son) rời hàng công sự, rút về phía tây bắc; ruộng chìm trong bóng tối
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "tan-thoi": { ...shot([0, 0, 40], 90, 220, 110, 1), mood: MOOD.dawn + 0.6 },
    "bo-ruong": { ...shot([10, 0, 0], 100, 140, 50, -1), mood: MOOD.overcast + 0.6 },
    "truc-thang": { ...shot([70, 0, -30], 170, 200, 90, 1), mood: MOOD.sunset + 0.65 },
    "rut-dem": { ...shot([-70, 0, 50], 60, 200, 110, -1), mood: MOOD.sunset + 0.85 },
  },
};

export default config;
