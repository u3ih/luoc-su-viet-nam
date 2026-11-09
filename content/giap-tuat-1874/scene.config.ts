import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (HA_NOI) bắc; Sài Gòn (SAI_GON) nam; biển phía đông.
// Hoạt cảnh trong từng phân cảnh: sáu tỉnh Nam Kỳ (đốm xanh nhạt) lần lượt dưới quyền Pháp: ba tỉnh miền đông rồi ba tỉnh miền tây; quân Pháp (xanh nhạt) chiếm Hà Nội và các tỉnh Bắc Kỳ; quân triều và quân Cờ Đen (son) vây Hà Nội; Cầu Giấy (đốm ngà); theo thanh kéo, quân Pháp ở Bắc Kỳ (đốm xanh nhạt) tắt dần, tàu (chấm xanh nhạt) rút về nam; đốm vàng (hoà ước) ở Sài Gòn; Bắc Kỳ trở lại (đốm ngà); sáu tỉnh Nam Kỳ (đốm xanh nhạt) vẫn thuộc Pháp
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "nam-ky": { ...shot([60, 0, -260], 260, 230, 130, 1), mood: MOOD.dawn + 0.5 },
    "bac-ky": { ...shot([-40, 0, 250], 80, 260, 140, -1), mood: MOOD.sunset + 0.55 },
    "ky-ket": { ...shot([0, 0, 0], 80, 360, 260, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([0, 0, 0], 95, 360, 260, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
