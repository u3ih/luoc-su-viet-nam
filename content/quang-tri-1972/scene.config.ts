import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thạch Hãn giữa; thành cổ (THANH_CO) bờ nam; Mỹ Chánh (MY_CHANH) nam.
// Hoạt cảnh trong từng phân cảnh: các đoàn quân (son) từ phía bắc vượt sông vào thành cổ rồi xuống phía nam; dòng người dân (ngà) chạy loạn về phía nam; hai sư đoàn (xanh nhạt) từ tuyến Mỹ Chánh tiến lên phía bắc, hai bên quốc lộ; đốm vàng ở thành cổ; theo thanh kéo, lửa bom pháo bùng khắp quanh thành cổ; người giữ thành (son) trong thành; quân phản công (xanh nhạt) tiến dần tới chân tường; hoa đăng (đốm vàng) trôi trên sông Thạch Hãn; người dân (ngà) đứng dọc bờ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "xuan-he": { ...shot([0, 0, 40], 90, 260, 150, 1), mood: MOOD.overcast + 0.6 },
    "lam-son-72": { ...shot([0, 0, -90], 90, 200, 110, -1), mood: MOOD.day },
    "81-ngay": { ...shot([0, 0, -10], 70, 160, 80, 1), mood: MOOD.sunset + 0.75 },
    "thach-han": { ...shot([0, 0, 45], 80, 150, 50, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
