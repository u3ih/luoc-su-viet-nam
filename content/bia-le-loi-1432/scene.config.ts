import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { VACH, DEN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Đà tây bắc → đông nam; Mường Lễ (MUONG_LE) thượng nguồn; vách đá (VACH) bờ bắc; đền (DEN).
// Hoạt cảnh trong từng phân cảnh: đốm ngà (châu Mường Lễ) ở thượng nguồn; một đoàn (xanh nhạt) rời Mường Lễ đi về phía tây nam; theo thanh kéo, đoàn quân (son) đi bộ và đoàn thuyền (đốm vàng) cùng ngược sông Đà lên Mường Lễ; đốm vàng (bài thơ khắc trên vách đá) sáng bên bờ bắc; quân (son) dừng chân dưới vách; đốm vàng (khối bia) chuyển lên đền thờ trên cao; khách (son) tới viếng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [330,160,-340], look: [0,0,40], mood: MOOD.dawn + 0.3 },
    "muong-le": { ...shot([-230, 0, 210], 130, 300, 150, 1), mood: MOOD.dawn + 0.5 },
    "than-chinh": { ...shot([50, 0, -20], 140, 330, 170, -1), mood: MOOD.sunset + 0.55 },
    "khac-da": { ...shot([VACH[0], 0, VACH[1]], 100, 170, 70, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([DEN[0], 0, DEN[1]], 110, 200, 110, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
