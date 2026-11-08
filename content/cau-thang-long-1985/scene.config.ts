import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CAU } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Hồng; bờ tây (BO_TAY), bờ đông (BO_DONG); cầu (CAU) ngang sông.
// Hoạt cảnh trong từng phân cảnh: chín cột đốm ngà (trụ cầu) mọc giữa sông, ba cột dở dang mờ; người (son) trên hai bờ; theo thanh kéo, mười lăm nhịp dầm (hàng đốm vàng) lần lượt nối từ bờ tây sang bờ đông; hai tầng đốm sáng: tầng dưới (ngà, đường sắt), tầng trên (vàng, ô tô); chấm sáng (tàu, xe) chạy qua; đêm: dải đèn trên cầu sáng; tàu xe qua lại
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "khoi-cong": { ...shot([CAU[0], 0, CAU[1]], 60, 260, 110, 1), mood: MOOD.overcast + 0.4 },
    "lam-lai": { ...shot([CAU[0], 0, CAU[1]], 80, 300, 120, -1), mood: MOOD.day },
    "hai-tang": { ...shot([60, 0, 0], 100, 180, 40, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([CAU[0], 0, CAU[1]], 70, 300, 120, -1), mood: MOOD.sunset + 0.8 },
  },
};

export default config;
