import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HOA_LU, CHUA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hoa Lư (HOA_LU) giữa núi đá; chùa (CHUA); núi Du Hý (DU_HY) bắc.
// Hoạt cảnh trong từng phân cảnh: một chấm ngà nhỏ (cậu bé) đi tới chùa (đốm vàng); theo thanh kéo, các chùa (đốm vàng) quanh kinh đô lần lượt sáng; tăng đoàn (ngà) về kinh; đoàn sứ (xanh nhạt) ngược sông tới Hoa Lư; đốm vàng (khúc từ tiễn sứ) sáng ở kinh; học trò (son) tìm tới núi Du Hý (đốm vàng)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "cua-thien": { ...shot([CHUA[0], 0, CHUA[1]], 80, 200, 80, 1), mood: MOOD.dawn + 0.5 },
    "tang-thong": { ...shot([HOA_LU[0], 0, HOA_LU[1]], 80, 280, 130, -1), mood: MOOD.sunset + 0.6 },
    "ngoc-lang-quy": { ...shot([HOA_LU[0], 0, HOA_LU[1]], 80, 230, 100, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([100, 0, 230], 80, 280, 140, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
