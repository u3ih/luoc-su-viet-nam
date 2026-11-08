import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { DAM } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đầm (DAM), nền đất giữa đầm (NEN); trại quân Lương (TRAI_*); Khuất Lão (KHUAT_LAO) tây bắc; cửa Đại Nha (DAI_NHA) nam.
// Hoạt cảnh trong từng phân cảnh: đốm ngà (Lý Nam Đế) ở Khuất Lão lịm; đốm ngà thứ hai (Triệu Quang Phục) dẫn người (son) về phía đầm; theo thanh kéo (ngày → đêm): người (son) đứng yên trên nền đất giữa đầm; khi đêm xuống, thuyền độc mộc (chấm son sáng) lướt ra đánh trại quân Lương, lửa bùng ở các trại; quân Lương (xanh nhạt) rời các trại rút về phía bắc; người (son) từ đầm tràn ra; đốm ngà chạy về phía nam đến cửa biển Đại Nha rồi lịm; các đốm vàng (đền thờ) sáng dọc vùng ven biển
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "nhan-viec": { ...shot([-200, 0, 200], 50, 260, 130, 1), mood: MOOD.overcast + 0.4 },
    "da-trach": { ...shot([DAM[0], 0, DAM[1]], 80, 240, 120, -1), mood: MOOD.sunset + 0.7 },
    "thang-luong": { ...shot([DAM[0], 0, DAM[1]], 60, 280, 150, 1), mood: MOOD.dawn + 0.4 },
    "ve-sau": { ...shot([-20, 0, -250], 270, 220, 110, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
