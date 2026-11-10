import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thăng Long (THANG_LONG) giữa; đồng ruộng tây nam; Văn Miếu (VAN_MIEU) nam.
// Hoạt cảnh trong từng phân cảnh: triều thần (chấm ngà) tụ về kinh thành; đốm vàng (vua mới) sáng lên giữa hoàng thành; từ kinh thành, vòng đốm vàng lan rộng ra khắp các phủ châu (tên nước mới); theo thanh kéo, ruộng đồng (đốm vàng thấp) lần lượt chín; dân (son) ra đồng gặt; các quan (chấm ngà) vào chầu; Văn Miếu (cột đốm vàng) dựng lên phía nam kinh thành
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "noi-ngoi": { ...shot([60, 0, 80], 80, 250, 130, 1), mood: MOOD.dawn + 0.5 },
    "quoc-hieu": { ...shot([40, 0, 60], 75, 270, 150, -1), mood: MOOD.sunset + 0.55 },
    "thuong-dan": { ...shot([-100, 0, -40], 70, 270, 150, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([40, 0, 20], 80, 240, 120, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
