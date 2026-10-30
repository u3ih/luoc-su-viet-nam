import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HONG_CHAU, DAI_LA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đồng bằng; sông lớn chảy từ tây bắc xuống đông nam; Đại La (DAI_LA) bên bờ sông ở giữa; Hồng Châu (HONG_CHAU) ở đông nam. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: các nhóm người (son) từ làng quanh tụ về Hồng Châu, một đốm ngà sáng dần; đoàn ngà đi từ Hồng Châu tới Đại La; đốm xanh nhạt ở Đại La mờ đi, đốm ngà sáng lên; các nhóm người (son) từ nhiều nơi tụ về Đại La theo thanh kéo; đốm vàng sáng ở Đại La; quầng ngà dịu ở Đại La, các nhóm người (son) đến đứng lặng, lửa bật dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,180,-300], look: [20,0,40], mood: MOOD.dawn + 0.3 },
    "hong-chau": { ...shot([HONG_CHAU[0], 0, HONG_CHAU[1]], 160, 220, 110, 1), mood: MOOD.day },
    "nam-905": { ...shot([DAI_LA[0], 0, DAI_LA[1]], 90, 230, 120, -1), mood: MOOD.overcast + 0.4 },
    "tu-chu": { ...shot([DAI_LA[0], 0, DAI_LA[1]], 30, 250, 130, 1), mood: MOOD.dawn + 0.8 },
    "ve-sau": { ...shot([DAI_LA[0], 0, DAI_LA[1]], 150, 230, 120, -1), mood: MOOD.sunset },
  },
};

export default config;
