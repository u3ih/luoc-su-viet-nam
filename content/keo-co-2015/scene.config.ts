import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sân đình (SAN_DINH) giữa; đình (DINH) bắc.
// Hoạt cảnh trong từng phân cảnh: đình (đốm vàng) sáng; dân làng (son) đổ về sân đình dự hội; sợi dây (chuỗi đốm ngà) căng ngang sân; đốm son ở giữa dây (khăn đỏ); theo thanh kéo, hai phe (son, ngà) nắm dây; phe bên trái kéo cả hai hàng người dịch dần về phía mình; đốm vàng sáng bên phe thắng; bốn đốm vàng (bốn nước cùng ghi danh) sáng quanh rìa; đốm vàng ở đình
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "hoi-xuan": { ...shot([0, 0, 50], 85, 200, 110, 1), mood: MOOD.dawn + 0.5 },
    "day-keo": { ...shot([0, 0, 40], 85, 150, 80, -1), mood: MOOD.sunset + 0.6 },
    "keo": { ...shot([0, 0, 40], 90, 150, 80, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([0, 0, 40], 80, 270, 190, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
