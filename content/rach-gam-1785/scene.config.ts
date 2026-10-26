import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HA_TIEN, MY_THO } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông lớn chảy từ tây sang đông giữa đồng bằng thấp; cù lao giữa dòng; khúc sông Rạch Gầm (tây,
// RACH_GAM) – Xoài Mút (đông, XOAI_MUT) là nơi diễn hoạt cảnh; Mỹ Tho ở bờ nam (MY_THO), Hà Tiên ở tây nam (HA_TIEN). Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (đoàn quân Xiêm đến Hà Tiên, quân Tây Sơn lùi nhử quân Xiêm lên sông, hai đầu và hai bờ khép lại, Nguyễn Ánh
// chạy ra phía sông, bờ sông sáng đèn khi trận đã yên) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Máy quay thường đứng phía bắc nhìn xuống nam để dòng sông chạy ngang màn hình.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-340, 170, 260], look: [60, 0, -40], mood: MOOD.dawn + 0.3 },
    "cau-vien": { ...shot([HA_TIEN[0] + 30, 2, HA_TIEN[1] + 10], 270, 230, 120, 1), mood: MOOD.overcast + 0.3 },
    "nhu-dich": { ...shot([-20, 0, -30], 270, 270, 150, -1), mood: MOOD.dawn + 0.7 },
    "rach-gam": { ...shot([20, 0, -20], 270, 310, 170, 1, 0.25), mood: MOOD.sunset + 0.7 },
    "bo-chay": { ...shot([190, 0, -60], 250, 280, 140, -1), mood: MOOD.dawn + 0.5 },
    "ket": { ...shot([MY_THO[0] - 20, 0, -80], 280, 360, 200, 1, 0.2), mood: MOOD.sunset - 0.2 },
  },
};

export default config;
