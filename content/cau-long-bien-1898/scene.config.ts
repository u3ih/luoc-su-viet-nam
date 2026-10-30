import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HA_NOI, BAI_GIUA, GIA_LAM } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông chảy bắc – nam ở giữa; bờ Hà Nội (HA_NOI) phía tây, bờ Gia Lâm (GIA_LAM) phía đông, bãi giữa (BAI_GIUA). Tuyến ngang sông là diễn hoạ, không vẽ cầu. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: các nhóm người (son) tụ về bờ Hà Nội, một đốm ngà sáng dần, lửa bật lên; các toán thợ (son) từ hai bờ đi ra giữa sông theo thanh kéo, đốm ngà sáng dần dọc tuyến ngang sông; dòng người (son) qua lại giữa hai bờ, một dải ánh sáng vàng dọc tuyến ngang sông; dải ánh sáng vàng dọc tuyến sáng rồi dịu bớt, các nhóm người (son) từ hai bờ ra đứng giữa tuyến, đốm vàng sáng lại
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,190,-300], look: [30,0,20], mood: MOOD.dawn + 0.3 },
    "dau-thau": { ...shot([HA_NOI[0], 0, HA_NOI[1]], 160, 230, 120, 1), mood: MOOD.day },
    "dung-cau": { ...shot([BAI_GIUA[0], 0, BAI_GIUA[1]], 90, 270, 150, -1), mood: MOOD.overcast + 0.2 },
    "thong-xe": { ...shot([BAI_GIUA[0], 0, BAI_GIUA[1]], 110, 250, 130, 1), mood: MOOD.sunset - 0.2 },
    "ve-sau": { ...shot([GIA_LAM[0], 0, GIA_LAM[1]], 20, 240, 120, -1), mood: MOOD.dawn + 0.9 },
  },
};

export default config;
