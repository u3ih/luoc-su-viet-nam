import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh thành (KINH) giữa; 13 thừa tuyên là điểm tượng trưng quanh kinh.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (vua) ở kinh; các chấm ngà (sứ mang lệnh) tỏa ra mười ba hướng; theo thanh kéo, mười ba đốm vàng (bản đồ thừa tuyên) sáng ở mười ba nơi rồi chấm ngà mang về kinh; kinh thành sáng dần; năm đốm vàng (năm tập) xếp hàng ở kinh; tập đầu sáng nhất; đốm vàng gốc lịm (bản gốc thất truyền); mười đốm ngà nhỏ (mười bản chép) sáng quanh
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "lenh-ve": { ...shot([KINH[0], 0, KINH[1]], 80, 220, 100, 1), mood: MOOD.day },
    "thua-tuyen": { ...shot([KINH[0], 0, KINH[1]], 80, 380, 210, -1), mood: MOOD.sunset + 0.35 },
    "nam-tap": { ...shot([KINH[0], 0, KINH[1]], 80, 180, 80, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([KINH[0], 0, KINH[1]], 70, 200, 90, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
