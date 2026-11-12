import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (HA_NOI), Phủ Doãn (PHU_DOAN) giữa; Huế (HUE) nam; khoảng trống (MAT) đông.
// Hoạt cảnh trong từng phân cảnh: đốm vàng nhỏ (cậu bé) ở Huế; chấm ngà đi ra Hà Nội học; sinh viên (son) tụ trước bệnh viện Phủ Doãn; một đốm ngà (người trúng tuyển nội trú) sáng lên; theo thanh kéo, các đốm vàng nối nhau thành cây mạch máu phân nhánh (bản đồ mạch máu của gan, cách điệu); cột đốm vàng (các công trình) cao dần; thế hệ học trò (son) tỏa đi
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "xuat-than": { ...shot([40, 0, -60], 70, 250, 150, 1), mood: MOOD.dawn + 0.5 },
    "noi-tru": { ...shot([-60, 0, 20], 80, 180, 90, -1), mood: MOOD.sunset + 0.6 },
    "la-gan": { ...shot([80, 0, 20], 85, 150, 100, 1), mood: MOOD.sunset + 0.6 },
    "mo-gan-kho": { ...shot([20, 0, 10], 80, 230, 120, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
