import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HA_TIEN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Tiên (HA_TIEN) bên đầm Đông Hồ; biển tây nam; NGOAI_KHOI hướng thuyền tới.
// Hoạt cảnh trong từng phân cảnh: đốm ngà (Mạc Thiên Tứ) ở Hà Tiên; ba chấm vàng (thuyền Long Bài) và thuyền buôn (chấm ngà) cập bến; theo thanh kéo, đốm vàng (gác Chiêu Anh) sáng; thuyền (chấm ngà) từ biển xa và người (son) từ phía bắc tụ về; mười đốm vàng (mười cảnh Hà Tiên) sáng quanh vùng; vòng ba mươi hai đốm ngà nhỏ (thi nhân) quanh gác; lửa bùng ở Hà Tiên (năm 1771); các đốm vàng mười cảnh vẫn còn sáng mờ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "noi-nghiep": { ...shot([HA_TIEN[0], 0, HA_TIEN[1]], 250, 220, 110, 1), mood: MOOD.day },
    "gac-chieu-anh": { ...shot([-100, 0, -100], 230, 300, 160, -1), mood: MOOD.sunset + 0.45 },
    "thap-vinh": { ...shot([HA_TIEN[0], 0, HA_TIEN[1]], 80, 280, 150, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([HA_TIEN[0], 0, HA_TIEN[1]], 70, 230, 120, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
