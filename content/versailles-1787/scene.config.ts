import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Gia Định (GIA_DINH) tây bắc; Phú Quốc (PHU_QUOC) tây nam; Pondichéry (PONDI) giữa biển; Lorient (LORIENT), Versailles (VERSAILLES) đông bắc.
// Hoạt cảnh trong từng phân cảnh: thuyền Nguyễn Ánh (đốm ngà) chạy từ Gia Định ra đảo Phú Quốc; thuyền Tây Sơn (xanh nhạt) đuổi theo; theo thanh kéo, con tàu (đốm ngà) đi từ Phú Quốc qua Pondichéry tới cảng Lorient; ở Versailles (đốm vàng), hai bên ký hiệp ước: chấm ngà (Bá Đa Lộc, hoàng tử Cảnh) gặp người Pháp (xanh nhạt); tàu (đốm ngà) trở lại Pondichéry chờ mãi; quân không đến (đốm xanh nhạt ở Pháp lịm); cuối cùng tàu về Gia Định
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,160,-330], look: [20,0,40], mood: MOOD.dawn + 0.3 },
    "the-cung": { ...shot([-250, 0, 20], 80, 280, 160, 1), mood: MOOD.dawn + 0.5 },
    "duong-sang": { ...shot([0, 0, 20], 80, 340, 210, -1), mood: MOOD.sunset + 0.6 },
    "ky-ket": { ...shot([220, 0, 230], 60, 200, 90, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([0, 0, 40], 80, 340, 210, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
