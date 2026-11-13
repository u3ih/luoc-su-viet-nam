import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Quảng trường (BA_DINH) giữa; lăng (LANG) tây; vườn (VUON) phía sau.
// Hoạt cảnh trong từng phân cảnh: ba đốm ngà (ba miền) mờ dần; một đốm vàng ở giữa quảng trường sáng lên; người (son) đứng lặng quanh; theo thanh kéo, khối lăng (tường thấp) đắp lên ở chỗ lễ đài cũ; thợ (son) làm việc quanh; ba lớp đốm sáng chồng lên trên khối lăng (thềm, thân, mái — cách điệu); vườn cây ba miền (đốm xanh nhạt nhỏ) quanh lăng; dòng người viếng (ngà) đi qua quảng trường
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "di-chuc": { ...shot([20, 0, 0], 180, 180, 80, 1), mood: MOOD.overcast + 0.6 },
    "khoi-cong": { ...shot([-10, 0, 0], 180, 150, 60, -1), mood: MOOD.day },
    "ba-lop": { ...shot([-30, 0, 0], 190, 120, 40, 1), mood: MOOD.sunset + 0.6 },
    "vuon": { ...shot([-60, 0, 0], 160, 170, 80, -1), mood: MOOD.day },
  },
};

export default config;
