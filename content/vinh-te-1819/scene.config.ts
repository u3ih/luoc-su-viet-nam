import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CHAU_DOC, DOAN_GIUA, HA_TIEN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía nam, sông lớn chảy bắc – nam ở phía đông; Châu Đốc (CHAU_DOC) đông bắc, Hà Tiên (HA_TIEN) tây nam, đoạn giữa (DOAN_GIUA). Tuyến kênh là diễn hoạ. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: các nhóm người (son) tụ về Châu Đốc, một đốm ngà sáng dần, lửa bật lên; các toán dân phu (son) đi dọc tuyến kênh từ Châu Đốc sang Hà Tiên theo thanh kéo, đốm ngà sáng dần dọc tuyến; quầng vàng sáng ở Châu Đốc, các nhóm người (son) đến đứng lặng, lửa bật dần; một dải ánh sáng vàng dịu dọc tuyến kênh, vài nhóm người (son) đến đứng lặng ở hai đầu
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,190,-300], look: [30,0,20], mood: MOOD.dawn + 0.3 },
    "lenh-dao": { ...shot([CHAU_DOC[0], 0, CHAU_DOC[1]], 110, 220, 120, 1), mood: MOOD.day },
    "dao-kenh": { ...shot([DOAN_GIUA[0], 0, DOAN_GIUA[1]], 125, 240, 120, -1), mood: MOOD.overcast + 0.3 },
    "doi-ten": { ...shot([CHAU_DOC[0], 0, CHAU_DOC[1]], 130, 230, 120, 1), mood: MOOD.sunset - 0.2 },
    "ve-sau": { ...shot([HA_TIEN[0], 0, HA_TIEN[1]], 250, 240, 120, -1), mood: MOOD.sunset + 0.3 },
  },
};

export default config;
