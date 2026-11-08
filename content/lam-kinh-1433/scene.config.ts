import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { LAM_KINH, NUI_DAU } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Núi Dầu (NUI_DAU) bắc, sông Chu phía nam, núi Chúa (NUI_CHUA) tiền án; Lam Kinh (LAM_KINH), Vĩnh Lăng (VINH_LANG), bia (BIA).
// Hoạt cảnh trong từng phân cảnh: đàn đốm vàng nhỏ (đàn chim) lượn quanh chân núi Dầu; một gia đình (son) dời đến ở; người (son) đắp thành dọc bốn cạnh theo thanh kéo; vòng thành Lam Kinh dựng lên; đốm vàng sáng ở Vĩnh Lăng; đốm ngà (bia đá) sáng ở chỗ dựng bia; người (son) đến đứng lặng; các đốm vàng (lăng các vua, hoàng hậu) sáng dần quanh Lam Kinh
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "dat-to": { ...shot([NUI_DAU[0], 0, NUI_DAU[1]], 80, 260, 130, 1), mood: MOOD.day },
    "tay-kinh": { ...shot([LAM_KINH[0], 0, LAM_KINH[1]], 80, 240, 130, -1), mood: MOOD.overcast + 0.3 },
    "vinh-lang": { ...shot([-90, 0, 30], 60, 180, 80, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([LAM_KINH[0], 0, LAM_KINH[1]], 70, 280, 150, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
