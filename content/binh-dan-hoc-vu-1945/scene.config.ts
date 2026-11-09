import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Bốn làng quanh cánh đồng; đình (DINH) ở giữa.
// Hoạt cảnh trong từng phân cảnh: dân các làng (son) ra đồng làm việc; làng còn tối; theo thanh kéo, các lớp học (đốm vàng) lần lượt sáng lên ở đình và các làng; người đi học (son) tụ về; đội nhi đồng (chấm ngà) đi khắp ngõ xóm cổ động; chữ cái treo ở cổng làng (đốm ngà); khắp vùng (rồi cả nước) lớp học sáng lên dày đặc
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "mu-chu": { ...shot([0, 0, 20], 80, 260, 120, 1), mood: MOOD.dawn + 0.5 },
    "lop-hoc": { ...shot([0, 0, 20], 75, 260, 130, -1), mood: MOOD.sunset + 0.65 },
    "i-tu": { ...shot([-120, 0, 60], 80, 220, 100, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([0, 0, 30], 90, 340, 230, -1), mood: MOOD.sunset + 0.75 },
  },
};

export default config;
