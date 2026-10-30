import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { PHU_XUAN, LUY_NHAT_LE, PHIA_BAC } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông, núi ở phía tây; luỹ Trường Dục (LUY_TRUONG_DUC) phía tây, luỹ Nhật Lệ (LUY_NHAT_LE) phía đông, Phú Xuân (PHU_XUAN) phía nam, phía bắc (PHIA_BAC) xa. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: các nhóm người (son) từ phía bắc đi vào Phú Xuân, một đốm ngà sáng dần, lửa bật lên; các toán dân binh (son) đi dọc tuyến luỹ từ chân núi ra gần biển theo thanh kéo, hai đốm ngà sáng lần lượt ở hai đầu luỹ; một đoàn xanh nhạt từ phía bắc tiến về phía tuyến luỹ rồi dừng lại phía trước luỹ; quầng vàng dịu dọc tuyến luỹ, các nhóm người (son) đến đứng lặng, lửa bật dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,190,-300], look: [30,0,20], mood: MOOD.dawn + 0.3 },
    "dao-duy-tu": { ...shot([PHU_XUAN[0], 0, PHU_XUAN[1]], 250, 220, 120, 1), mood: MOOD.day },
    "ke-sach": { ...shot([LUY_NHAT_LE[0], 0, LUY_NHAT_LE[1]], 200, 240, 130, -1), mood: MOOD.overcast + 0.2 },
    "khay-day-kep": { ...shot([PHIA_BAC[0], 0, PHIA_BAC[1]], 90, 250, 140, 1), mood: MOOD.overcast + 0.6 },
    "ve-sau": { ...shot([LUY_NHAT_LE[0], 0, LUY_NHAT_LE[1]], 170, 230, 120, -1), mood: MOOD.sunset },
  },
};

export default config;
