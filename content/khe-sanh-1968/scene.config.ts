import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Căn cứ Tà Cơn (TA_CON) giữa; Làng Vây (LANG_VAY) tây nam; làng Bru (LANG_BRU) bắc.
// Hoạt cảnh trong từng phân cảnh: lính (xanh nhạt) trong căn cứ; đốm vàng ở sân bay; các làng Bru (đốm ngà) quanh cao nguyên; theo thanh kéo, các sư đoàn (son) khép vòng vây quanh căn cứ; lửa pháo kích loé trong căn cứ; trại Làng Vây (đốm xanh nhạt) tắt; lửa bom bùng khắp vòng đồi quanh căn cứ; máy bay vận tải (đốm xanh nhạt) bay vào tiếp tế; lính (xanh nhạt) rời căn cứ về phía đông; lửa phá huỷ trong căn cứ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "ta-con": { ...shot([0, 0, 0], 90, 180, 100, 1), mood: MOOD.overcast + 0.6 },
    "vay-can-cu": { ...shot([0, 0, 0], 60, 230, 140, -1), mood: MOOD.sunset + 0.7 },
    "niagara": { ...shot([0, 0, 0], 120, 240, 150, 1), mood: MOOD.sunset + 0.65 },
    "pha-bo": { ...shot([40, 0, 10], 30, 180, 90, -1), mood: MOOD.overcast + 0.6 },
  },
};

export default config;
