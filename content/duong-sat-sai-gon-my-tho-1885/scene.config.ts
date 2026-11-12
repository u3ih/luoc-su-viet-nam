import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sài Gòn (SAI_GON) đông bắc; Bến Lức (BEN_LUC), Tân An (TAN_AN) giữa; Mỹ Tho (MY_THO) tây nam.
// Hoạt cảnh trong từng phân cảnh: hàng nghìn người (son) đắp nền, đặt ray dọc tuyến; các đốm ngà (ga) lần lượt đánh dấu; toa tàu (chấm vàng) lên phà (đốm ngà) qua sông Vàm Cỏ Đông rồi nối lại chạy tiếp; theo thanh kéo, đoàn tàu hơi nước (chuỗi chấm vàng) chạy từ Sài Gòn qua 15 ga (đốm ngà) tới Mỹ Tho; khách (son) đông nghịt ở ga Sài Gòn những năm đầu, thưa dần; đốm ga tắt (1958)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "khoi-cong": { ...shot([60, 0, 60], 70, 260, 140, 1), mood: MOOD.dawn + 0.5 },
    "qua-pha": { ...shot([-2, 0, 30], 80, 170, 80, -1), mood: MOOD.sunset + 0.6 },
    "chuyen-dau": { ...shot([-40, 0, 0], 45, 270, 150, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([200, 0, 160], 70, 200, 100, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
