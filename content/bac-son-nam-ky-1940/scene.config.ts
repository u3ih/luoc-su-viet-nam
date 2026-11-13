import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Lạng Sơn (LANG_SON), Mỏ Nhài (MO_NHAI) bắc; Đô Lương (DO_LUONG), Vinh (VINH_N) giữa; Nam Kỳ (NAM_KY) nam.
// Hoạt cảnh trong từng phân cảnh: quân Nhật (xanh nhạt) từ biên giới phía bắc tràn xuống Lạng Sơn; đồn Pháp (đốm ngà) tắt; tàn quân (ngà) chạy về phía nam; theo thanh kéo, người các bản (son) kéo về đồn Mỏ Nhài; lửa đốt sổ sách ở đồn; đêm 22 tháng 11, đốm son lần lượt bừng lên ở nhiều làng Nam Kỳ; vài nơi có lửa; lính (son) từ đồn Chợ Rạng chiếm đồn Đô Lương rồi theo đường về Vinh; đốm vàng ở Vinh tắt (kế hoạch không thành)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "lang-son": { ...shot([30, 0, 150], 80, 210, 120, 1), mood: MOOD.overcast + 0.6 },
    "bac-son": { ...shot([-70, 0, 50], 100, 170, 80, -1), mood: MOOD.dawn + 0.6 },
    "nam-ky": { ...shot([90, 0, -150], 90, 210, 130, 1), mood: MOOD.sunset + 0.7 },
    "do-luong": { ...shot([-80, 0, -80], 0, 180, 90, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
