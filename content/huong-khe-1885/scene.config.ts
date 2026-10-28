import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { DON_NU, VU_QUANG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông; núi rừng cao dần về phía tây; căn cứ Vụ Quang (VU_QUANG) ở chân núi bên sông; tỉnh lỵ Hà Tĩnh (HA_TINH) gần cửa sông;
// Nghệ An (NGHE_AN) và đồn Nu (DON_NU) ở phía bắc; Tân Sở (TAN_SO) ở phía nam xa. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (lệnh từ phía nam tới căn cứ, người rút lên núi và một đốm đi ra phía bắc rồi trở về, ánh lửa lan ra các tỉnh, đoàn quân tiến đánh đồn Nu,
// vòng vây khép dần) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [380, 230, -300], look: [-80, 5, 60], mood: MOOD.dawn + 0.3 },
    "giao-viec": { ...shot([VU_QUANG[0] + 10, 5, VU_QUANG[1]], 180, 230, 140, 1), mood: MOOD.overcast + 0.3 },
    "chuan-bi": { ...shot([-120, 0, 120], 270, 240, 150, -1), mood: MOOD.dawn + 0.6 },
    "mo-rong": { ...shot([-40, 0, 60], 90, 320, 230, 1, 0.2), mood: MOOD.day },
    "cao-thang": { ...shot([DON_NU[0] - 40, 0, DON_NU[1] - 100], 200, 230, 140, -1), mood: MOOD.sunset },
    "vay-ep": { ...shot([VU_QUANG[0], 5, VU_QUANG[1]], 135, 280, 200, 1), mood: MOOD.overcast + 0.7 },
  },
};

export default config;
