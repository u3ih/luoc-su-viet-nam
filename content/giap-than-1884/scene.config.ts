import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HUE } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông, núi ở phía tây; Huế (HUE) ở giữa dải đất bên một con sông; Hà Nội (HA_NOI) ở đầu bắc; Sài Gòn (SAI_GON) ở đầu nam. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (ba đốm nối nhau sáng ở Huế, hai phía tụ về Huế, dải đốm vạch ranh giới ba vùng theo thanh kéo)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [320, 190, -320], look: [-30, 0, 20], mood: MOOD.dawn + 0.3 },
    "boi-canh": { ...shot([HUE[0], 0, HUE[1]], 160, 240, 120, 1), mood: MOOD.overcast + 0.4 },
    "ky-uoc": { ...shot([HUE[0] - 10, 0, HUE[1]], 170, 220, 110, -1), mood: MOOD.day },
    "ba-mien": { ...shot([20, 0, 0], 165, 400, 260, 1), mood: MOOD.dawn + 0.8 },
  },
};

export default config;
