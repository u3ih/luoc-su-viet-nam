import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { LANG_CU } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía nam; Tiền Hải (TIEN_HAI) đông, Kim Sơn (KIM_SON) tây, làng cũ (LANG_CU) bắc. Đê là diễn hoạ.
// Hoạt cảnh trong từng phân cảnh: đốm ngà sáng ở làng cũ, người (son) tụ lại; các toán dân (son) từ làng cũ xuống bãi Tiền Châu, dàn hàng dọc tuyến đê theo thanh kéo (người dừng lại thành vệt đê); ruộng mới sáng dần (vàng), lửa đồn canh bật lên; các toán dân (son) xuống bãi bồi Kim Sơn, dàn hàng dọc tuyến đê Đường Quan; kênh xương cá sáng dần (vàng); các vệt vàng (những lần quai đê) lần lượt sáng ra phía biển; người (son) tụ về ấp Lạc Thiện, lửa bật quanh đền
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [30,160,-390], look: [0,0,60], mood: MOOD.dawn + 0.3 },
    "hy-van": { ...shot([LANG_CU[0], 0, LANG_CU[1]], 80, 170, 70, 1), mood: MOOD.sunset + 0.4 },
    "tien-hai": { ...shot([260, 0, -100], 85, 270, 130, -1), mood: MOOD.day },
    "kim-son": { ...shot([-170, 0, -100], 95, 250, 120, 1), mood: MOOD.day },
    "lan-bien": { ...shot([-150, 0, -110], 80, 280, 140, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
