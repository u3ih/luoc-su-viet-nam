import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { THANG_LONG, THO_LOI, BA_CHAU } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển phía đông; Thăng Long (THANG_LONG), Thổ Lỗi (THO_LOI) bắc; ba châu (BA_CHAU) giữa; Phật Thệ (PHAT_THE) nam. Khoảng cách thu ngắn rất nhiều.
// Hoạt cảnh trong từng phân cảnh: dân (son) đổ ra xem đoàn ngự giá; một đốm ngà đứng riêng; đốm vàng (vua) dừng lại rồi cùng về kinh; đoàn thuyền (ngà) rời Thăng Long theo đường biển xuống phương nam theo thanh kéo; đốm ngà (Nguyên phi) sáng ở Thăng Long; ba đốm vàng (ba châu) sáng dần ở giữa dải đất; đoàn thuyền (ngà) trở về phương bắc; đốm ngà (Nguyên phi) sáng ở Thăng Long; người (son) tụ về; đốm vàng nhỏ ở các chùa quanh kinh
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "tua-lan": { ...shot([THO_LOI[0], 0, THO_LOI[1]], 90, 200, 90, 1), mood: MOOD.day },
    "nam-chinh": { ...shot([100, 0, 20], 250, 360, 190, -1), mood: MOOD.overcast + 0.3 },
    "ba-chau": { ...shot([BA_CHAU[0], 0, BA_CHAU[1]], 70, 260, 130, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([THANG_LONG[0], 0, THANG_LONG[1]], 80, 230, 110, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
