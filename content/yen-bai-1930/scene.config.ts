import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { YEN_BAI } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Vùng núi ở tây bắc với Yên Bái (YEN_BAI); sông lớn chảy từ tây bắc xuống đông nam; Hà Nội ở giữa đồng bằng; Phả Lại, Vĩnh Bảo, Kiến An ở phía đông. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (bốn đốm mục tiêu sáng dần, các nhóm tụ về Yên Bái theo thanh kéo từ đêm đến sáng, đốm sáng bật rồi tắt ở nhiều nơi, Yên Bái lặng dần)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-300, 190, -300], look: [-80, 0, 100], mood: MOOD.night - 0.3 },
    "boi-canh": { ...shot([-20, 0, 60], 20, 380, 240, 1), mood: MOOD.dawn + 0.8 },
    "dem-yen-bai": { ...shot([YEN_BAI[0], 0, YEN_BAI[1]], 200, 190, 140, -1), mood: MOOD.night },
    "nhieu-noi": { ...shot([-20, 0, 40], 30, 300, 200, 1), mood: MOOD.dawn + 0.5 },
    "phien-toa": { ...shot([YEN_BAI[0], 0, YEN_BAI[1]], 200, 230, 130, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
