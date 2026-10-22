import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CITY, LAKE, OATH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Hồng ở phía đông (x ≈ 210); kinh thành là vùng đất bằng quanh CITY, có hồ nhỏ (LAKE);
// bãi hội thề ở phía nam thành (OATH). Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (vòng vây quanh thành, hai bên gặp nhau ở bãi hội thề, quân Minh rút theo sông và đường bộ, ánh sáng
// lan tới các làng khi bài cáo truyền đi, người tụ về kinh thành, đốm sáng nổi lên giữa hồ) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320, 150, -320], look: [40, 5, 60], mood: MOOD.dawn + 0.3 },
    "dong-quan": { ...shot([CITY[0], 3, CITY[1]], 60, 340, 210, 1, 0.25), mood: MOOD.overcast + 0.3 },
    "hoi-the": { ...shot([OATH[0], 3, OATH[1]], 80, 190, 100, -1), mood: MOOD.dawn + 0.7 },
    "ve-nuoc": { ...shot([120, 0, 180], 70, 400, 240, 1, 0.2), mood: MOOD.overcast + 0.6 },
    "dai-cao": { ...shot([0, 0, 40], 90, 460, 300, -1, 0.15), mood: MOOD.day },
    "len-ngoi": { ...shot([CITY[0], 3, CITY[1]], 100, 230, 110, 1), mood: MOOD.sunset - 0.3 },
    "tra-guom": { ...shot([LAKE.x, 2, LAKE.z], 60, 150, 55, -1), mood: MOOD.dawn + 0.8 },
  },
};

export default config;
