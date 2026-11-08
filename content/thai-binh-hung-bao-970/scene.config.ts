import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HOA_LU, BEN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh đô Hoa Lư (HOA_LU) giữa núi đá vôi; sông Hoàng Long; bến (BEN).
// Hoạt cảnh trong từng phân cảnh: đốm vàng lớn (vua, niên hiệu Thái Bình) sáng ở Hoa Lư; người (son) tụ về; theo thanh kéo, lò đúc (lửa) đỏ lên; từng đốm vàng nhỏ (đồng tiền) ra lò xếp thành hàng; thuyền buôn (chấm ngà) cập bến sông Hoàng Long; đốm vàng nhỏ (tiền) theo người ra bến; đốm vàng (tiền Thái Bình) lịm dần, đốm vàng nhạt mới (tiền Thiên Phúc) sáng thay
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "nien-hieu": { ...shot([HOA_LU[0], 0, HOA_LU[1]], 90, 200, 100, 1), mood: MOOD.day },
    "duc-tien": { ...shot([HOA_LU[0], 0, HOA_LU[1]], 90, 140, 50, -1), mood: MOOD.sunset + 0.65 },
    "luu-hanh": { ...shot([BEN[0], 0, BEN[1]], 270, 220, 100, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([HOA_LU[0], 0, HOA_LU[1]], 90, 200, 90, -1), mood: MOOD.sunset + 0.55 },
  },
};

export default config;
