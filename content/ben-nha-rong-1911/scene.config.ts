import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { BEN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông chảy từ phía bắc xuống biển ở đông nam; thành phố Sài Gòn (SAI_GON) ở tây bắc; bến (BEN) và cầu tàu (CAU_TAU) bên một khúc sông gần thành phố. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (người đi lại ở bến và tàu đậu, một đốm sáng đi từ thành phố ra tàu, tàu xuôi sông ra biển theo thanh kéo, quầng sáng tưởng niệm ở bến) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330, 200, -300], look: [30, 0, 0], mood: MOOD.dawn + 0.3 },
    "ben-cang": { ...shot([BEN[0] - 10, 0, BEN[1]], 90, 220, 100, 1), mood: MOOD.day },
    "len-tau": { ...shot([40, 0, 50], 0, 220, 90, -1), mood: MOOD.sunset - 0.2 },
    "nho-neo": { ...shot([140, 0, -110], 45, 300, 150, 1), mood: MOOD.dawn + 0.8 },
    "ngay-nay": { ...shot([BEN[0] - 10, 0, BEN[1]], 135, 220, 100, -1), mood: MOOD.day },
  },
};

export default config;
