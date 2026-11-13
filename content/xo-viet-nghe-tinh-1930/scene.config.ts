import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Vinh (VINH) đông; Hưng Nguyên (HUNG_NGUYEN) tây nam; làng (LANG) tây bắc.
// Hoạt cảnh trong từng phân cảnh: công nhân (son) rời nhà máy ở Bến Thuỷ (đốm vàng), tụ thành đoàn bãi công; theo thanh kéo, nông dân (son) từ các làng nhập vào đoàn biểu tình đi từ Hưng Nguyên về phía Vinh; ở nhiều làng (đốm ngà), bộ máy cũ (đốm xanh nhạt) tắt, các uỷ ban tự quản (đốm vàng) sáng; dân làng (son) họp quanh đình; lính (xanh nhạt) trở lại các đồn; các uỷ ban (đốm vàng) lần lượt tắt
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "ben-thuy": { ...shot([200, 0, 20], 80, 180, 90, 1), mood: MOOD.overcast + 0.6 },
    "hung-nguyen": { ...shot([40, 0, 0], 85, 260, 130, -1), mood: MOOD.day },
    "xo-viet": { ...shot([-80, 0, 80], 80, 250, 140, 1), mood: MOOD.sunset + 0.6 },
    "tran-ap": { ...shot([-80, 0, 60], 85, 230, 120, -1), mood: MOOD.overcast + 0.7 },
  },
};

export default config;
