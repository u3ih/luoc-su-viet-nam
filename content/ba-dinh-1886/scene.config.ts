import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { BA_DINH, DONG_BIEN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông; ba làng Ba Đình (BA_DINH) ở giữa vùng đất thấp phía bắc; Đồng Biên (DONG_BIEN) ở tây; Mã Cao (MA_CAO) ở tây nam; Thanh Hoá
// (THANH_HOA) ở phía nam xa. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (các thủ lĩnh tụ về Đồng Biên rồi ba đốm đi về Ba Đình, vòng luỹ khép quanh ba làng, quân Pháp vây dần, Ba Đình mất và nghĩa quân phá vây về Mã Cao,
// các đốm sáng mờ dần) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [330, 190, -330], look: [-40, 0, 60], mood: MOOD.dawn + 0.3 },
    "dong-bien": { ...shot([DONG_BIEN[0] + 20, 0, DONG_BIEN[1]], 0, 230, 120, 1), mood: MOOD.overcast + 0.3 },
    "chien-luy": { ...shot([BA_DINH[0], 0, BA_DINH[1]], 90, 230, 120, -1), mood: MOOD.dawn + 0.8 },
    "vay-ham": { ...shot([BA_DINH[0], 0, BA_DINH[1]], 60, 280, 150, 1), mood: MOOD.overcast + 0.7 },
    "mat-ba-dinh": { ...shot([BA_DINH[0] - 60, 0, BA_DINH[1] - 10], 330, 260, 130, -1), mood: MOOD.sunset },
    "sau-do": { ...shot([-150, 0, -40], 20, 300, 180, 1), mood: MOOD.overcast + 0.6 },
  },
};

export default config;
