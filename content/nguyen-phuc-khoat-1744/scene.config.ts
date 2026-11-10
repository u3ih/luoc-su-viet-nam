import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Phú Xuân (PHU_XUAN) giữa; các dinh dọc ven biển; biển phía đông.
// Hoạt cảnh trong từng phân cảnh: đô thành Phú Xuân (khối tường) dựng lên; đốm vàng (phủ chúa) sáng giữa thành; quần thần (chấm ngà) tụ về; sáu bộ (sáu đốm ngà) lần lượt sáng quanh điện; theo thanh kéo, các dinh (đốm vàng) dọc ven biển sáng dần từ Phú Xuân ra hai đầu; dân (son) các dinh đổi sang màu ngà khi tới nơi; đốm vàng ở Phú Xuân lịm dần; quan lại (chấm ngà) tụ quanh điện
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "phu-xuan": { ...shot([20, 0, 50], 80, 250, 140, 1), mood: MOOD.dawn + 0.5 },
    "xung-vuong": { ...shot([20, 0, 50], 85, 200, 100, -1), mood: MOOD.sunset + 0.55 },
    "y-phuc": { ...shot([40, 0, 0], 90, 270, 150, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([20, 0, 50], 75, 260, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
