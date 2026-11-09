import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { PHU_UNG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Làng Phù Ủng (PHU_UNG); đường quan; chỗ ngồi đan sọt (VEN_DUONG); sông phía đông.
// Hoạt cảnh trong từng phân cảnh: dân làng (son) kéo tới nhà mở tiệc (đốm vàng); một chấm ngà (Ngũ Lão) ở lại ven đường; theo thanh kéo, đoàn quân (son) theo đường quan tiến lại gần chấm ngà ngồi đan sọt; đốm vàng (Hưng Đạo Vương) dừng bên cạnh; thuyền giặc (xanh nhạt) trên sông; quân (son) phục hai bên bờ đánh ra; quân giặc ngã; đền thờ (đốm vàng) trên nền nhà cũ ở Phù Ủng; dân (son) về lễ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "phu-ung": { ...shot([PHU_UNG[0], 0, PHU_UNG[1]], 80, 200, 80, 1), mood: MOOD.dawn + 0.5 },
    "dan-sot": { ...shot([0, 0, -30], 80, 190, 70, -1), mood: MOOD.sunset + 0.55 },
    "danh-nguyen": { ...shot([260, 0, -20], 0, 250, 110, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([PHU_UNG[0], 0, PHU_UNG[1]], 85, 180, 75, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
