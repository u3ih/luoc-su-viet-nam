import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Núi Tản Viên (TAN_VIEN) tây; kinh đô (KINH) giữa; biển (BIEN) đông.
// Hoạt cảnh trong từng phân cảnh: Sơn Tinh (đốm ngà) từ núi Tản Viên, Thủy Tinh (đốm xanh nhạt) từ biển cùng đến kinh đô (đốm vàng); đoàn sính lễ (chấm ngà) đến kinh đô trước rồi rước Mỵ Nương (đốm vàng) về núi; đoàn của Thủy Tinh (xanh nhạt) đến sau; theo thanh kéo, quân của Thủy Tinh (xanh nhạt) dâng lên từ biển; cột đốm vàng trên núi Tản Viên cao dần; dân (son) đắp đê (chuỗi đốm ngà); quân Thủy Tinh (xanh nhạt) rút về biển; các làng (đốm vàng) sáng lại; đê (chuỗi đốm ngà) vẫn giữ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "ken-re": { ...shot([20, 0, -30], 80, 270, 150, 1), mood: MOOD.dawn + 0.5 },
    "sinh-le": { ...shot([-70, 0, -10], 75, 270, 150, -1), mood: MOOD.sunset + 0.55 },
    "nuoc-dang": { ...shot([-80, 0, 0], 60, 270, 150, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([80, 0, -40], 80, 270, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
