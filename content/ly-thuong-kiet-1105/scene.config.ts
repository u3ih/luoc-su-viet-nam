import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thăng Long (THANG_LONG) bắc; Như Nguyệt (NHU_NGUYET) đông bắc; Thanh Hóa (THANH_HOA) nam; Diễn Châu nam xa.
// Hoạt cảnh trong từng phân cảnh: Lý Thường Kiệt (chấm ngà) từ Thăng Long vào Thanh Hóa, Nghệ An; các châu, động (đốm ngà) lần lượt yên; đạo quân (son) từ Thăng Long lên giữ phòng tuyến sông Như Nguyệt (chuỗi đốm vàng); theo thanh kéo, các làng quanh trấn Thanh Hóa (đốm vàng) lần lượt sáng; dân (son) ra đồng; Lý Thường Kiệt (chấm ngà) về Thăng Long; quân (son) xuống Diễn Châu rồi trở về; đốm vàng ở Thăng Long lịm dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "xuat-than": { ...shot([0, 0, -40], 75, 270, 150, 1), mood: MOOD.dawn + 0.5 },
    "ba-trieu": { ...shot([130, 0, 220], 60, 260, 140, -1), mood: MOOD.sunset + 0.55 },
    "thanh-hoa": { ...shot([-60, 0, -230], 270, 230, 130, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([-20, 0, -60], 80, 270, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
