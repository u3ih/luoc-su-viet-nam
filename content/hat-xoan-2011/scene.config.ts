import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { DEN_HUNG, DINH_A } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đền Hùng (DEN_HUNG) trên núi tây bắc; các đình (DINH_*) giữa đồng; sông phía đông.
// Hoạt cảnh trong từng phân cảnh: đền Hùng (đốm vàng) trên núi; người (son) lên đền dâng hát mùa xuân; theo thanh kéo, bốn phường Xoan (chấm ngà) lần lượt tới các cửa đình (đốm vàng); phường Xoan (chấm ngà) múa thành vòng trước cửa đình; dân (son) đứng xem; các đình và đền Hùng (đốm vàng) sáng; người (son) dự hội khắp vùng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "goc-tich": { ...shot([DEN_HUNG[0], 0, DEN_HUNG[1]], 70, 260, 120, 1), mood: MOOD.dawn + 0.5 },
    "phuong-xoan": { ...shot([20, 0, -10], 80, 300, 140, -1), mood: MOOD.sunset + 0.6 },
    "the-cach": { ...shot([DINH_A[0], 0, DINH_A[1]], 80, 150, 60, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([20, 0, 0], 80, 260, 120, -1), mood: MOOD.sunset + 0.55 },
  },
};

export default config;
