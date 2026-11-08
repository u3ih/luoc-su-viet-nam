import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { SON_NAM, MUONG_THANH, BAN_PHU } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sơn Nam (SON_NAM) đông nam, Thanh Hóa (THANH_HOA) tây nam, Hưng Hóa (HUNG_HOA) giữa; Mường Thanh (MUONG_THANH), Bản Phủ (BAN_PHU), Tam Vạn (TAM_VAN) tây bắc.
// Hoạt cảnh trong từng phân cảnh: các toán nghĩa quân (son) luồn qua vùng đầm lầy Sơn Nam; quân triều đình (xanh nhạt) kéo đến rồi rút; đốm ngà giữa vùng; nghĩa quân (son, đốm ngà dẫn đầu) từ Sơn Nam qua Thanh Hóa, Hưng Hóa vượt núi lên Mường Thanh theo thanh kéo; vòng thành Bản Phủ đắp dần lên; người các bản mường (son) từ chân núi tụ về Bản Phủ, các đốm vàng (bản mường quy phục) sáng dần quanh cánh đồng; quân Trịnh (xanh nhạt) từ phía đông nam tiến vào cánh đồng; đốm ngà ở Bản Phủ lịm dần, lửa bùng quanh thành
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [330,170,-330], look: [-60,0,60], mood: MOOD.dawn + 0.3 },
    "son-nam": { ...shot([SON_NAM[0], 0, SON_NAM[1]], 90, 180, 100, 1), mood: MOOD.overcast + 0.3 },
    "muong-thanh": { ...shot([-60, 0, 40], 120, 360, 200, -1), mood: MOOD.day },
    "chua-muong": { ...shot([MUONG_THANH[0], 0, MUONG_THANH[1]], 100, 230, 130, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([BAN_PHU[0], 0, BAN_PHU[1]], 120, 200, 110, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
