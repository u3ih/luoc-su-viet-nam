import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH, LANG_LIEU } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh đô (KINH); nhà Lang Liêu (LANG_LIEU) bên đồng lúa; rừng núi phía bắc.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (vua) giữa vòng 22 đốm ngà (các lang); các lang tỏa đi khắp nơi (lên rừng săn, ra sông chài lưới); theo thanh kéo: hạt nếp (đốm trắng) từ đồng lúa về nhà Lang Liêu; một ô vuông đốm xanh (bánh chưng) và một vòng đốm trắng (bánh giầy) thành hình; các lang (chấm ngà) mang lễ vật về kinh; đốm xanh và đốm trắng (bánh của Lang Liêu) sáng rực trước vua; Tết: lửa nồi bánh chưng đỏ ở khắp các làng; đốm vàng ấm (bàn thờ) trong từng nhà
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "truyen-ngoi": { ...shot([KINH[0], 0, KINH[1]], 80, 200, 90, 1), mood: MOOD.day },
    "lam-banh": { ...shot([LANG_LIEU[0], 0, LANG_LIEU[1]], 80, 160, 60, -1), mood: MOOD.sunset + 0.55 },
    "dang-le": { ...shot([KINH[0], 0, KINH[1]], 70, 180, 80, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([0, 0, -40], 80, 330, 180, -1), mood: MOOD.sunset + 0.75 },
  },
};

export default config;
