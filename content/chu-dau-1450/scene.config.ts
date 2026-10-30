import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { NAM_SACH, CHU_DAU, BEN_XA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đồng bằng sông nước, không biển; Chu Đậu (CHU_DAU) giữa bên sông, Nam Sách (NAM_SACH) tây bắc, bến xa (BEN_XA) đông nam. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: các nhóm người (son) tụ về Nam Sách, một đốm ngà sáng dần, vài lửa lò bật lên; các lò lửa ở Chu Đậu nhóm lên dần theo thanh kéo, các nhóm người (son) tụ về làng; đoàn người (son) đi từ Chu Đậu dọc sông ra bến xa; đốm vàng sáng ở bến
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,190,-300], look: [30,0,20], mood: MOOD.dawn + 0.3 },
    "chiec-binh": { ...shot([NAM_SACH[0], 0, NAM_SACH[1]], 70, 230, 120, 1), mood: MOOD.day },
    "tim-lai": { ...shot([CHU_DAU[0], 0, CHU_DAU[1]], 140, 220, 120, -1), mood: MOOD.overcast + 0.2 },
    "den-noi-xa": { ...shot([BEN_XA[0], 0, BEN_XA[1]], 100, 210, 140, 1), mood: MOOD.sunset },
  },
};

export default config;
