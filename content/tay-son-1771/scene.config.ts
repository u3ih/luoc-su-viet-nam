import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { QUY_NHON, TAY_SON, TRAM } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông (x > 270); núi cao dần về phía tây; sông chảy từ tây ra biển;
// ấp Tây Sơn ở chân đồi phía tây (TAY_SON), thành Quy Nhơn sát biển (QUY_NHON), trạm thu thuế giữa đồng bằng (TRAM). Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (người dân nộp thuế, ba anh em ở ấp, người từ các làng tụ về đồn trại, nhóm người vào thành rồi quân
// tràn vào, quân từ phía bắc tiến xuống và quầng sáng của chúa Nguyễn lùi về phía nam) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [340, 200, 300], look: [-60, 10, 40], mood: MOOD.dawn + 0.3 },
    "chua-suy": { ...shot([TRAM[0], 4, TRAM[1]], 200, 240, 140, 1), mood: MOOD.overcast + 0.3 },
    "ba-anh-em": { ...shot([TAY_SON[0], 6, TAY_SON[1]], 150, 190, 80, -1), mood: MOOD.dawn + 0.6 },
    "tay-son": { ...shot([TAY_SON[0], 6, TAY_SON[1]], 120, 250, 160, 1), mood: MOOD.day },
    "quy-nhon": { ...shot([QUY_NHON[0], 3, QUY_NHON[1]], 200, 180, 85, -1), mood: MOOD.sunset + 0.6 },
    "ba-ben": { ...shot([70, 0, 130], 235, 400, 290, 1, 0.2), mood: MOOD.sunset - 0.3 },
  },
};

export default config;
