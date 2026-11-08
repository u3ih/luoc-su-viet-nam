import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CHO_CU, CHO_MOI } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Bến Nghé phía nam; chợ cũ (CHO_CU); chợ mới (CHO_MOI) trên ao Bồ Rệt; ga (GA).
// Hoạt cảnh trong từng phân cảnh: ghe thuyền (chấm ngà) đậu dày bên bến; người (son) tụ ở chợ bên sông; lửa ở chợ cũ (1870) rồi chợ dựng lại (năm đốm vàng = năm gian hàng); con kênh mờ dần (bị lấp); theo thanh kéo, ao lầy (đốm xanh nhạt) tắt dần, người (son) lấp ao; các đốm vàng (chợ mới) xếp dần thành khối; ba đêm hội: pháo bông (đốm sáng nhiều màu trên cao), người (son) đông nghịt quanh chợ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "ben-thanh": { ...shot([CHO_CU[0], 0, CHO_CU[1]], 90, 200, 90, 1), mood: MOOD.day },
    "cho-cu": { ...shot([80, 0, -100], 80, 220, 100, -1), mood: MOOD.sunset + 0.4 },
    "xay-cho": { ...shot([CHO_MOI[0], 0, CHO_MOI[1]], 80, 170, 70, 1), mood: MOOD.dawn + 0.5 },
    "ve-sau": { ...shot([CHO_MOI[0], 0, CHO_MOI[1]], 80, 180, 70, -1), mood: MOOD.sunset + 0.8 },
  },
};

export default config;
