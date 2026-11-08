import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { BUON_A } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Các buôn làng (BUON_*) trên cao nguyên.
// Hoạt cảnh trong từng phân cảnh: vòng đốm vàng (người đánh cồng chiêng) quanh đốm ngà (nhà rông) trong buôn; theo thanh kéo, tiếng cồng chiêng (vòng đốm vàng) lan từ buôn này sang buôn khác khắp cao nguyên; lửa lễ hội giữa buôn; người (son) nhảy vòng quanh lửa; các buôn làng đều sáng vòng đốm vàng; đốm vàng lớn (ghi danh) giữa cao nguyên
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "cong-chieng": { ...shot([BUON_A[0], 0, BUON_A[1]], 80, 160, 60, 1), mood: MOOD.sunset + 0.5 },
    "buon-lang": { ...shot([0, 0, 0], 80, 380, 210, -1), mood: MOOD.sunset + 0.45 },
    "le-hoi": { ...shot([BUON_A[0], 0, BUON_A[1]], 70, 150, 50, 1), mood: MOOD.sunset + 0.8 },
    "ve-sau": { ...shot([0, 0, 0], 80, 340, 190, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
