import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { THANH, CHUA_DAU } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thành Luy Lâu (THANH) bên sông Dâu; chùa Dâu (CHUA_DAU); NGOAI hướng thuyền buôn.
// Hoạt cảnh trong từng phân cảnh: đốm ngà (Thái thú) theo thuyền đến bến sông, vào thành; ba đốm ngà nhỏ (các em) đi về ba phía xa; theo thanh kéo, vòng thành chữ nhật đắp cao; người (son) đắp thành; thuyền buôn (chấm vàng) cập bến sông Dâu trước thành; đốm vàng (chùa Dâu) và các đốm vàng nhỏ (chùa Đậu, Tướng, Dàn) quanh; học trò (son) tụ về lớp học trong thành (đốm ngà); đốm ngà trong thành lịm dần; đốm vàng chùa Dâu vẫn sáng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "thai-thu": { ...shot([THANH[0], 0, THANH[1]], 80, 280, 150, 1), mood: MOOD.day },
    "thanh-luy-lau": { ...shot([0, 0, -40], 80, 300, 170, -1), mood: MOOD.day },
    "chua-dau": { ...shot([CHUA_DAU[0], 0, CHUA_DAU[1]], 280, 200, 90, 1), mood: MOOD.sunset + 0.55 },
    "ve-sau": { ...shot([THANH[0], 0, THANH[1]], 70, 260, 130, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
