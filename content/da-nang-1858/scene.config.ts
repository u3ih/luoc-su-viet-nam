import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { BO_BIEN, DON_DONG, LIEU_TRI, VINH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía bắc và phía đông; bán đảo Sơn Trà là ngọn đồi ăn ra biển ở đông bắc; vịnh (VINH) nơi tàu
// đậu ở phía bắc; hai đồn (DON_DONG, DON_TAY); nơi liên quân đóng sau khi đổ bộ (BO_BIEN); phòng tuyến Liêu Trì (LIEU_TRI) ở phía tây nam. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (tàu vào vịnh, đồn bốc lửa và đổ bộ, quân tiếp viện về Liêu Trì, luỹ đất khép dần quanh nơi đóng, hàng quân thưa dần
// vì bệnh, phần lớn đội tàu đi về phía nam) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330, 220, -250], look: [40, 5, 140], mood: MOOD.dawn + 0.3 },
    "cua-bien": { ...shot([VINH[0] + 10, 0, VINH[1] - 20], 90, 230, 120, 1), mood: MOOD.overcast + 0.3 },
    "son-tra": { ...shot([DON_DONG[0] - 10, 5, DON_DONG[1]], 90, 230, 115, -1), mood: MOOD.dawn + 0.8 },
    "lieu-tri": { ...shot([LIEU_TRI[0] + 20, 4, LIEU_TRI[1]], 30, 230, 120, 1, 0.25), mood: MOOD.day - 0.0 },
    "luy-dat": { ...shot([70, 0, 100], 90, 320, 200, -1, 0.2), mood: MOOD.overcast },
    "kho-khan": { ...shot([BO_BIEN[0], 3, BO_BIEN[1]], 0, 220, 105, 1), mood: MOOD.sunset - 0.1 },
    "vao-nam": { ...shot([120, 0, 220], 90, 300, 160, -1, 0.3), mood: MOOD.dawn + 0.5 },
  },
};

export default config;
