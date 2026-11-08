import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CANH_DOC, VUNG_LOI } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Bờ (BO) tây bắc; vịnh nhiều đảo đá; đảo Canh Độc (CANH_DOC); vùng lõi (VUNG_LOI).
// Hoạt cảnh trong từng phân cảnh: thuyền (chấm ngà) chậm rãi đi giữa các đảo đá; những đốm lửa nhỏ (người tiền sử) sáng ở chân các đảo; đốm ngà (thơ Nguyễn Trãi) trên bờ; theo thanh kéo, vòng đốm vàng khoanh vùng lõi di sản giữa vịnh; đốm vàng ấm (động Thiên Cung) trong lưng đảo Canh Độc; thuyền khách (chấm ngà) ghé đảo
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "dao-da": { ...shot([0, 0, -100], 270, 300, 120, 1), mood: MOOD.dawn + 0.5 },
    "nguoi-xua": { ...shot([0, 0, -80], 60, 220, 90, -1), mood: MOOD.sunset + 0.65 },
    "unesco": { ...shot([VUNG_LOI[0], 0, VUNG_LOI[1]], 270, 360, 220, 1), mood: MOOD.day },
    "ve-sau": { ...shot([CANH_DOC[0], 0, CANH_DOC[1]], 80, 200, 70, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
