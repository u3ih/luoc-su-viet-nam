import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Nơi họp (HOI_NGHI) giữa; bốn hướng phái đoàn BAC, NAM, DONG, TAY.
// Hoạt cảnh trong từng phân cảnh: hai phía (son, xanh nhạt) đến trước, rồi thêm hai phía nữa; các đốm vàng xếp thành vòng tròn quanh nơi họp; hai người (ngà, xanh nhạt) gặp riêng ở một góc; ánh lửa ở phía xa (tháng 12 năm 1972); theo thanh kéo, bốn phái đoàn (son, xanh nhạt) từ bốn phía tiến vào nơi ký (đốm vàng); đoàn quân (xanh nhạt) rời đi về phía đông tới chân trời; những người trở về (ngà) theo hướng ngược lại
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "ban-tron": { ...shot([0, 0, 40], 90, 180, 100, 1), mood: MOOD.overcast + 0.6 },
    "hop-kin": { ...shot([0, 0, 40], 80, 150, 70, -1), mood: MOOD.sunset + 0.6 },
    "ky-ket": { ...shot([0, 0, 40], 90, 170, 90, 1), mood: MOOD.day },
    "rut-quan": { ...shot([60, 0, 60], 75, 250, 140, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
