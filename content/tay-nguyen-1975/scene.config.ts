import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Phước Long (PHUOC_LONG) tây nam; Buôn Ma Thuột (BMT) giữa; Pleiku (PLEIKU) tây bắc; Cheo Reo (CHEO_REO), Củng Sơn (CUNG_SON) đông; Huế (HUE_T), Đà Nẵng (DA_NANG_T) đông bắc.
// Hoạt cảnh trong từng phân cảnh: các mũi quân (son) vây tỉnh lỵ Phước Long (đốm xanh nhạt); đốm xanh nhạt tắt; theo thanh kéo, một nhóm nhỏ (son) nghi binh ở Pleiku; các mũi quân (son) từ nhiều hướng tiến vào Buôn Ma Thuột; lửa trong thị xã; đoàn xe, đoàn người (ngà) dài dằng dặc theo đường số 7 từ Pleiku xuống Cheo Reo, Củng Sơn; lửa dọc đường; các nhóm (son) bên đường; đốm son sáng ở Huế rồi Đà Nẵng; thuyền (ngà) từ bờ Đà Nẵng ra biển
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "phuoc-long": { ...shot([-140, 0, -150], 60, 170, 100, 1), mood: MOOD.overcast + 0.6 },
    "buon-ma-thuot": { ...shot([-20, 0, -80], 90, 180, 100, -1), mood: MOOD.dawn + 0.6 },
    "duong-so-7": { ...shot([40, 0, 40], 30, 230, 130, 1), mood: MOOD.sunset + 0.65 },
    "hue-da-nang": { ...shot([140, 0, 140], 60, 200, 120, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
