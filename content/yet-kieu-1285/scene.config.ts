import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HA_BI, BAI_TAN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Làng Hạ Bì (HA_BI), đền Quát (DEN) bên sông; Bãi Tân (BAI_TAN) trên sông lớn.
// Hoạt cảnh trong từng phân cảnh: thuyền chài nhỏ (chấm ngà) trên sông Quát; người (son) ở bến đò; thuyền (đốm vàng) neo chờ ở Bãi Tân; vài chấm (son) từ chân núi tìm về bến; theo thanh kéo, đốm ngà (Yết Kiêu) lặn qua hàng thuyền giặc (xanh nhạt); các thuyền lần lượt chìm; đền Quát (đốm vàng) bên sông; thuyền đua (son) trên sông Quát
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "song-quat": { ...shot([HA_BI[0], 0, HA_BI[1]], 70, 200, 80, 1), mood: MOOD.dawn + 0.5 },
    "bai-tan": { ...shot([BAI_TAN[0], 0, BAI_TAN[1]], 80, 220, 90, -1), mood: MOOD.sunset + 0.5 },
    "duc-thuyen": { ...shot([80, 0, 0], 80, 200, 70, 1), mood: MOOD.sunset + 0.75 },
    "ve-sau": { ...shot([-200, 0, 120], 80, 230, 100, -1), mood: MOOD.sunset + 0.55 },
  },
};

export default config;
