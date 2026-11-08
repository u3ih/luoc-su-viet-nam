import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { TINH, NHA_LAO } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Tỉnh lỵ (TINH) giữa, nhà lao (NHA_LAO), trại lính (TRAI_LINH); sông Cầu phía đông, đồn khố đỏ (DON_KHO_DO); Tam Đảo (TAM_DAO) tây bắc, núi Pháo (NUI_PHAO) tây nam.
// Hoạt cảnh trong từng phân cảnh: đốm ngà (Lương Ngọc Quyến) trong nhà lao; lính khố xanh (son) ở trại gần đó; trong đêm, lính (son) từ trại kéo đến nhà lao, tù nhân (son) được giải ra rồi tỏa khắp tỉnh lỵ theo thanh kéo; lửa bùng vài nơi, đồn khố đỏ (xanh nhạt) cố thủ bên sông; quân Pháp (xanh nhạt) từ phía nam và phía đông kéo đến vây tỉnh lỵ; đốm ngà lịm dần; lửa bùng quanh thành; nghĩa quân (son, đốm ngà dẫn đầu) rút khỏi tỉnh lỵ lên Đại Từ, Tam Đảo rồi vòng về núi Pháo; đốm ngà lịm ở núi Pháo
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-300,150,-300], look: [0,0,20], mood: MOOD.dawn + 0.3 },
    "nha-lao": { ...shot([NHA_LAO[0], 0, NHA_LAO[1]], 70, 180, 80, 1), mood: MOOD.overcast + 0.3 },
    "dem-30": { ...shot([TINH[0], 0, TINH[1]], 80, 220, 110, -1), mood: MOOD.sunset + 0.8 },
    "sau-ngay": { ...shot([30, 0, -40], 100, 300, 150, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([-120, 0, 40], 150, 340, 190, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
