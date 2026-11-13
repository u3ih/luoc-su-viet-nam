import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thăng Long (THANG_LONG) tây bắc; cửa Tư Khách (TU_KHACH) giữa; sông Ngũ Bồ; Phật Thệ (PHAT_THE) nam.
// Hoạt cảnh trong từng phân cảnh: thuyền (son) đóng ở bến gần Thăng Long; thuyền Chăm (ngà) ven biển phía nam; theo thanh kéo, đoàn thuyền quân Lý (son) xuôi theo bờ biển vào nam tới cửa Tư Khách; quân Lý (son) vượt sông Ngũ Bồ tiến về kinh đô Phật Thệ (đốm ngà); đốm ngà tắt, lửa; đoàn thuyền (son) trở ra bắc; một đốm ngà nhỏ (Mỵ Ê) rời đoàn thuyền chìm xuống sông rồi tắt
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "khong-trieu-cong": { ...shot([0, 0, 60], 90, 250, 140, 1), mood: MOOD.overcast + 0.6 },
    "ngu-bo": { ...shot([60, 0, 80], 80, 250, 140, -1), mood: MOOD.dawn + 0.6 },
    "phat-the": { ...shot([20, 0, -130], 90, 180, 90, 1), mood: MOOD.sunset + 0.65 },
    "my-e": { ...shot([0, 0, 40], 120, 230, 120, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
