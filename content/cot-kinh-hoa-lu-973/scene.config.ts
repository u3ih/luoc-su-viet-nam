import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hoa Lư (HOA_LU) giữa; sông Hoàng Long bắc; Nhất Trụ (NHAT_TRU) nam.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (kinh đô Hoa Lư); đoàn sứ (ngà) rời kinh đô đi về phương bắc rồi trở về; đốm vàng (kinh đô) mờ đi; vòng đốm ngà nhỏ (những cột kinh) lần lượt sáng quanh kinh đô; theo thanh kéo, các cột kinh (đốm vàng) lần lượt hiện ra dọc bờ sông Hoàng Long; người đắp đê (ngà) làm việc; một cột sáng lớn (cột kinh chùa Nhất Trụ, đốm vàng xếp chồng) ở phía nam; các cột nhỏ (đốm ngà) quây quanh bảo tàng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "nam-viet-vuong": { ...shot([0, 0, 0], 90, 180, 90, 1), mood: MOOD.dawn + 0.5 },
    "sam-hoi": { ...shot([0, 0, 20], 70, 160, 80, -1), mood: MOOD.sunset + 0.7 },
    "tim-thay": { ...shot([0, 0, 100], 90, 170, 80, 1), mood: MOOD.day },
    "bao-vat": { ...shot([30, 0, -70], 100, 150, 70, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
