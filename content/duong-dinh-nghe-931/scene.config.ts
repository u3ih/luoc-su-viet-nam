import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { AI_CHAU, TONG_BINH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Vùng đồi ở phía tây bắc; sông lớn chảy từ tây bắc xuống đông nam; Tống Bình (TONG_BINH) bên bờ sông ở phía bắc; Ái Châu (AI_CHAU) ở phía nam. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: các nhóm người (son) từ làng quanh tụ về Ái Châu, một đốm ngà sáng dần, lửa bật lên; đoàn ngà đi từ Ái Châu ra Tống Bình theo thanh kéo; ở Tống Bình có đốm xanh nhạt (phía Nam Hán) mờ dần khi đoàn tới; quầng ngà dịu ở Tống Bình, các nhóm người (son) đến đứng lặng, lửa bật dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,190,-300], look: [-20,0,0], mood: MOOD.dawn + 0.3 },
    "ai-chau": { ...shot([AI_CHAU[0], 0, AI_CHAU[1]], 30, 220, 120, 1), mood: MOOD.day },
    "nam-931": { ...shot([TONG_BINH[0], 0, TONG_BINH[1]], 150, 250, 140, -1), mood: MOOD.overcast + 0.6 },
    "ve-sau": { ...shot([TONG_BINH[0], 0, TONG_BINH[1]], 110, 230, 120, 1), mood: MOOD.sunset },
  },
};

export default config;
