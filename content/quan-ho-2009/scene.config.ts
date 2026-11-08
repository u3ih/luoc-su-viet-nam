import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { LANG_B } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Cầu uốn khúc; các làng quan họ dọc hai bờ.
// Hoạt cảnh trong từng phân cảnh: thuyền (chấm ngà) xuôi sông Cầu; người (son) hai bờ; theo thanh kéo, 49 đốm vàng (49 làng quan họ) lần lượt sáng dọc hai bờ sông Cầu; hai hàng chấm đối nhau (liền anh ngà, liền chị son) hát đối; đốm vàng nhỏ (câu hát) bay qua lại; cả dải làng sáng; một đốm vàng lớn (ghi danh) trên sông
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "song-cau": { ...shot([0, 0, 40], 90, 300, 140, 1), mood: MOOD.dawn + 0.5 },
    "lang-quan-ho": { ...shot([0, 0, 40], 80, 380, 210, -1), mood: MOOD.sunset + 0.45 },
    "lan-dieu": { ...shot([LANG_B[0], 0, LANG_B[1]], 80, 150, 50, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([0, 0, 40], 90, 280, 120, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
