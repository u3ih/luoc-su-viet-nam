import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { MY_SON } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thung lũng Mỹ Sơn (MY_SON) giữa vòng núi; Trà Kiệu (TRA_KIEU) phía đông.
// Hoạt cảnh trong từng phân cảnh: một đốm vàng (đền gỗ thờ Shiva) giữa thung lũng; về sau lửa bùng (hỏa hoạn) và đốm vàng lịm; theo thanh kéo, các cụm tháp (cột đốm vàng, cao thấp khác nhau) lần lượt mọc lên khắp thung lũng; vài chấm ngà (nhà nghiên cứu) đi vào thung lũng; các đốm vàng mờ (tháp trong rừng) sáng dần lên; vài cụm đốm lịm đi (bị phá hủy); các cụm còn lại vẫn sáng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "den-go": { ...shot([MY_SON[0], 0, MY_SON[1]], 80, 180, 80, 1), mood: MOOD.sunset + 0.55 },
    "thap-gach": { ...shot([MY_SON[0], 0, MY_SON[1]], 70, 240, 120, -1), mood: MOOD.sunset + 0.5 },
    "tim-lai": { ...shot([MY_SON[0], 0, MY_SON[1]], 60, 240, 120, 1), mood: MOOD.dawn + 0.5 },
    "ve-sau": { ...shot([MY_SON[0], 0, MY_SON[1]], 80, 230, 110, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
