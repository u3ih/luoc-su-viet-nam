import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { DAM, LANG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển phía đông; đầm An Khê (DAM); làng (LANG) bên sông; gò mộ (GO_*).
// Hoạt cảnh trong từng phân cảnh: vài chấm ngà (người khảo cổ) đến bờ đầm; khoảng hai trăm đốm vàng nhỏ (chum táng) lộ ra quanh đầm; người làng (son) ra đồng ven sông; thuyền (chấm ngà) đánh cá ngoài biển; theo thanh kéo, ba gò lần lượt hiện những cụm đốm vàng (mộ chum); đốm ngà nhỏ (hạt cườm) lấp lánh; thuyền (chấm vàng) mang khuyên tai ra biển xa nhiều hướng; đốm vàng sáng ở các nơi xa ngoài khơi
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "kho-chum": { ...shot([DAM[0], 0, DAM[1]], 200, 220, 110, 1), mood: MOOD.day },
    "lang-ven-song": { ...shot([LANG[0], 0, LANG[1]], 80, 230, 110, -1), mood: MOOD.dawn + 0.5 },
    "mo-chum": { ...shot([100, 0, 0], 70, 230, 120, 1), mood: MOOD.sunset + 0.55 },
    "ve-sau": { ...shot([260, 0, -40], 0, 300, 150, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
