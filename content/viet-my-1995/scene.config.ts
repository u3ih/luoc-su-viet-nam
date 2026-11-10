import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Bờ tây (HA_NOI); đất phía đông (WASHINGTON); đại dương ở giữa.
// Hoạt cảnh trong từng phân cảnh: hai bờ (đốm ngà, đốm xanh nhạt) mờ; tàu (chấm sáng) ra giữa biển rồi quay về; đốm ngà ở Hà Nội sáng hơn; một đốm xanh nhạt nhỏ (văn phòng liên lạc) xuất hiện cạnh đó; theo thanh kéo, chuỗi đốm vàng nối hai bờ đại dương; hai đốm (đại sứ quán) sáng lên hai bên; tàu thuyền, hàng hoá (chấm sáng) qua lại hai chiều
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-300,170,-300], look: [0,0,0], mood: MOOD.dawn + 0.3 },
    "cam-van": { ...shot([0, 0, 0], 85, 330, 200, 1), mood: MOOD.dawn + 0.5 },
    "do-cam-van": { ...shot([-200, 0, 0], 70, 260, 150, -1), mood: MOOD.sunset + 0.55 },
    "binh-thuong-hoa": { ...shot([0, 0, 0], 90, 340, 220, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([0, 0, 0], 80, 320, 190, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
