import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH, DONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh thành (KINH); đồng lúa (DONG); sông phía đông.
// Hoạt cảnh trong từng phân cảnh: người (son) gặt lúa trên đồng; chín đốm vàng (chín bài thơ của vua) sáng ở kinh thành; đốm vàng (vua) giữa vòng 28 đốm ngà (28 vị); các đốm vàng nhỏ (bài họa) lần lượt sáng quanh theo thanh kéo; bốn đốm màu (bốn mùa) và mười hai đốm nhỏ (mười hai tháng) xoay vòng quanh kinh thành; các đốm vàng nhỏ (các tập thơ) gom lại thành một khối lớn (bộ Thiên Nam dư hạ tập)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "duoc-mua": { ...shot([DONG[0], 0, DONG[1]], 300, 240, 110, 1), mood: MOOD.day },
    "xuong-hoa": { ...shot([KINH[0], 0, KINH[1]], 80, 170, 70, -1), mood: MOOD.sunset + 0.65 },
    "noi-dung": { ...shot([KINH[0], 0, KINH[1]], 70, 260, 130, 1), mood: MOOD.dawn + 0.4 },
    "ve-sau": { ...shot([KINH[0], 0, KINH[1]], 80, 180, 80, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
