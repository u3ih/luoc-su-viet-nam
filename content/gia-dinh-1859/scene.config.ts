import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { THANH, PHAO_DAI } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Lòng Tàu từ đông nam; thành Gia Định (THANH) tây bắc, pháo đài (PHAO_DAI), rạch Thị Nghè; Phước Lý (PHUOC_LY) tây.
// Hoạt cảnh trong từng phân cảnh: đoàn tàu (xanh nhạt) từ biển xa vào cửa sông Lòng Tàu; đoàn tàu (xanh nhạt) ngược sông Lòng Tàu, bắn vào pháo đài; lửa bùng ở pháo đài; quân giữ đồn (son) rút; theo thanh kéo (rạng sáng → trưa): tàu (xanh nhạt) áp sát; liên quân (xanh nhạt) đổ bộ đánh vào thành; quân giữ thành (son) đứng ở các cửa rồi lui ra phía tây; thuyền gỗ (ngà) bỏ lại trên rạch Thị Nghè; thành bị phá: lửa bùng khắp trong thành; kho thóc cháy âm ỉ (đốm cam)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "roi-da-nang": { ...shot([260, 0, -260], 300, 260, 130, 1), mood: MOOD.overcast + 0.3 },
    "long-tau": { ...shot([PHAO_DAI[0], 0, PHAO_DAI[1]], 50, 240, 110, -1), mood: MOOD.sunset + 0.5 },
    "that-thu": { ...shot([THANH[0], 0, THANH[1]], 40, 220, 110, 1), mood: MOOD.dawn + 0.2 },
    "ve-sau": { ...shot([THANH[0], 0, THANH[1]], 60, 220, 110, -1), mood: MOOD.sunset + 0.75 },
  },
};

export default config;
