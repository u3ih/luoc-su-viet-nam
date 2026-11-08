import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { TRUNG_DO } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Lam phía nam; núi Quyết (NUI_QUYET), núi Mèo (NUI_MEO); Trung Đô (TRUNG_DO); La Sơn (LA_SON) phía tây.
// Hoạt cảnh trong từng phân cảnh: một chấm ngà (sứ giả) mang thư vào núi; đốm ngà (Nguyễn Thiếp) xuống núi gặp đốm vàng (Nguyễn Huệ); các đạo quân (son) tụ về dưới chân núi Dũng Quyết; đốm vàng ở giữa; người (son) đắp thành dọc các cạnh theo thanh kéo; hai vòng thành dựng lên; các đốm vàng nhỏ (sách dịch ra chữ Nôm) sáng dần ở nơi Nguyễn Thiếp ở ẩn
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "la-son": { ...shot([-200, 0, 80], 90, 260, 130, 1), mood: MOOD.day },
    "trung-do": { ...shot([TRUNG_DO[0], 0, TRUNG_DO[1]], 70, 280, 140, -1), mood: MOOD.overcast + 0.3 },
    "xay-thanh": { ...shot([TRUNG_DO[0], 0, TRUNG_DO[1]], 80, 230, 120, 1), mood: MOOD.overcast + 0.4 },
    "ve-sau": { ...shot([-150, 0, 80], 90, 300, 150, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
