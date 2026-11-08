import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { THANH, BEN_NGHE } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thành Bát Quái (THANH); bến Nghé (BEN_NGHE); thành Phụng (THANH_PHUNG) đông bắc.
// Hoạt cảnh trong từng phân cảnh: ghe thuyền (chấm ngà) tấp nập ở bến Nghé; đoàn thuyền (son) vào sông; theo thanh kéo, người (son) đắp thành theo tám cạnh; vòng thành tám cạnh dựng lên; tám đốm vàng (tám cửa); lửa trong thành cũ (bị phá); đốm vàng (thành Phụng nhỏ hơn) sáng ở đông bắc; tàu (xanh nhạt) theo sông vào; lửa bùng ở thành Phụng rồi tắt, chỉ còn đốm mờ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "ben-nghe": { ...shot([BEN_NGHE[0], 0, BEN_NGHE[1]], 90, 200, 90, 1), mood: MOOD.day },
    "xay-thanh": { ...shot([THANH[0], 0, THANH[1]], 80, 320, 190, -1), mood: MOOD.dawn + 0.45 },
    "thanh-phung": { ...shot([80, 0, 80], 80, 300, 160, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([THANH[0], 0, THANH[1]], 70, 280, 150, -1), mood: MOOD.sunset + 0.75 },
  },
};

export default config;
