import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh thành Huế (KINH) bờ bắc sông Hương; Bắc thành (BAC_THANH) xa phía bắc.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (vua) trong kinh thành; đốm ngà (Nguyễn Văn Thành) từ Bắc thành về, cùng hai đốm ngà nhỏ; theo thanh kéo, hai mươi hai đốm vàng (22 quyển) xếp thành hàng lần lượt sáng; sáu nhóm đốm vàng (sáu loại luật ứng sáu bộ) quanh một đốm ngà (danh lệ); các đốm vàng nhỏ (bộ luật) lan ra các trấn khắp vùng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "soan-luat": { ...shot([KINH[0], 0, KINH[1]], 80, 260, 140, 1), mood: MOOD.day },
    "hai-muoi-hai-quyen": { ...shot([KINH[0], 0, KINH[1]], 80, 170, 70, -1), mood: MOOD.sunset + 0.6 },
    "noi-dung": { ...shot([KINH[0], 0, KINH[1]], 70, 200, 90, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([KINH[0], 0, KINH[1]], 80, 330, 180, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
