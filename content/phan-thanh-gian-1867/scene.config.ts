import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { VINH_LONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Ba tỉnh miền Đông (GIA_DINH, BIEN_HOA, DINH_TUONG) phía đông; Vĩnh Long (VINH_LONG) giữa; An Giang (AN_GIANG), Hà Tiên (HA_TIEN) phía tây.
// Hoạt cảnh trong từng phân cảnh: đốm ngà rời Vĩnh Long đi về phía bắc dự thi; đốm vàng sáng ở Vĩnh Long; ba đốm vàng ở ba tỉnh miền Đông lịm dần, thay bằng đốm xanh nhạt; một đốm vàng sáng lại ở Vĩnh Long; chấm ngà (sứ bộ) từ Gia Định theo đường biển ra khơi theo thanh kéo; tàu (xanh nhạt) ngược sông lên Vĩnh Long; đốm ngà ở Vĩnh Long lịm dần; đốm vàng ở An Giang, Hà Tiên cũng tắt
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [40,0,60], mood: MOOD.dawn + 0.3 },
    "tien-si": { ...shot([VINH_LONG[0], 0, VINH_LONG[1]], 80, 220, 100, 1), mood: MOOD.day },
    "hoa-uoc": { ...shot([200, 0, 180], 60, 260, 130, -1), mood: MOOD.sunset + 0.5 },
    "su-bo": { ...shot([280, 0, -200], 315, 300, 150, 1), mood: MOOD.sunset + 0.6 },
    "vinh-long": { ...shot([VINH_LONG[0], 0, VINH_LONG[1]], 70, 200, 90, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
