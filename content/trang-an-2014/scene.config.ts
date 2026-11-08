import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HOA_LU, HANG_BOI } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Núi đá vôi dạng tháp; sông len giữa núi; cố đô Hoa Lư (HOA_LU) bắc; nhóm hang Bói (HANG_BOI) trung tâm.
// Hoạt cảnh trong từng phân cảnh: thuyền (chấm ngà) len theo sông giữa những núi đá vôi; theo thanh kéo, các đốm lửa (người tiền sử) lần lượt sáng trong các hang quanh trung tâm khối đá vôi; đốm vàng (cố đô Hoa Lư) ở phía bắc; người (son) qua lại; vòng đốm vàng (vùng lõi di sản kép) khoanh quanh khối núi; thuyền (chấm ngà) trên sông
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "nui-da": { ...shot([0, 0, -40], 90, 300, 140, 1), mood: MOOD.dawn + 0.5 },
    "tien-su": { ...shot([HANG_BOI[0], 0, HANG_BOI[1]], 270, 180, 80, -1), mood: MOOD.sunset + 0.6 },
    "hoa-lu": { ...shot([HOA_LU[0], 0, HOA_LU[1]], 90, 220, 110, 1), mood: MOOD.sunset + 0.45 },
    "ve-sau": { ...shot([0, 0, 0], 90, 360, 200, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
