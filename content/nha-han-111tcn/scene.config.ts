import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Phiên Ngung (PHIEN_NGUNG) bắc; biển đông nam; Giao Chỉ, Cửu Chân, Nhật Nam nam.
// Hoạt cảnh trong từng phân cảnh: sứ Hán (chấm xanh nhạt) vào thành; đốm vàng (vua Nam Việt) tắt; quân Lữ Gia (son) chiếm giữ trong thành; năm đạo quân Hán (xanh nhạt) từ phía bắc và tây bắc kéo xuống, dừng ngoài thành; theo thanh kéo, hai cánh quân Hán (xanh nhạt) khép vòng đông nam và tây bắc thành; lửa cháy trong thành; nhóm nhỏ (son) chạy ra biển; ba đốm xanh nhạt (Giao Chỉ, Cửu Chân, Nhật Nam) sáng ở phía nam; người dụ hàng (chấm ngà) đi từ thành xuống
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "chia-re": { ...shot([40, 0, 190], 80, 230, 130, 1), mood: MOOD.dawn + 0.5 },
    "nam-dao": { ...shot([20, 0, 220], 70, 270, 150, -1), mood: MOOD.sunset + 0.55 },
    "phien-ngung": { ...shot([40, 0, 200], 80, 240, 140, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([-40, 0, -150], 270, 250, 150, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
