import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Huế (HUE) giữa; Thuận An (THUAN_AN) đông bắc; Tân Sở (TAN_SO) tây; Đèo Ngang (DEO_NGANG) tây bắc; Bình Thuận nam.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (vua Tự Đức) trong kinh thành tắt; hai đốm ngà (Dục Đức, Hiệp Hoà) nối nhau sáng rồi một đốm mờ đi; tàu Pháp (chấm sáng xanh nhạt) từ biển vào cửa Thuận An; lửa cháy ở các đồn; theo thanh kéo, quân Pháp (xanh nhạt) đóng đồn ở Thuận An và Đèo Ngang; đốm ngà ở kinh thành vẫn sáng; súng đạn, lương thực (chấm son) lặng lẽ chuyển từ kinh thành lên căn cứ Tân Sở (đốm ngà) trong núi
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "tu-duc": { ...shot([20, 0, 40], 80, 250, 140, 1), mood: MOOD.dawn + 0.5 },
    "thuan-an": { ...shot([150, 0, 140], 60, 270, 150, -1), mood: MOOD.sunset + 0.6 },
    "ky-ket": { ...shot([20, 0, 120], 80, 270, 150, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([-140, 0, 10], 180, 260, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
