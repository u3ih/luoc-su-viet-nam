import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { DOANH_TRAI, COT_CO } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thành (THANH), doanh trại (DOANH_TRAI); sông Hồng phía đông; NGOAI phía bắc; cột cờ (COT_CO).
// Hoạt cảnh trong từng phân cảnh: các đốm ngà (người tuyên truyền) đi qua các đền, làng; nghĩa quân (son) tụ ở vùng ngoài thành phía bắc; theo thanh kéo (20 giờ → 21 giờ): lính Pháp (xanh nhạt) trong doanh trại ngã dần; bồi bếp, lính người Việt (son) chờ hiệu lệnh; một chấm ngà đi ra khỏi thành (tố giác); quân Pháp (xanh nhạt) đổ ra các cửa thành; nghĩa quân (son) ở ngoài lui đi; ba đốm ngà trước cột cờ lịm dần; người (son) đứng lặng xa xa
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "boi-canh": { ...shot([-60, 0, 120], 80, 320, 160, 1), mood: MOOD.overcast + 0.4 },
    "bua-toi": { ...shot([DOANH_TRAI[0], 0, DOANH_TRAI[1]], 80, 180, 80, -1), mood: MOOD.sunset + 0.8 },
    "bi-lo": { ...shot([-60, 0, 120], 80, 300, 150, 1), mood: MOOD.sunset + 0.85 },
    "ve-sau": { ...shot([COT_CO[0], 0, COT_CO[1]], 80, 180, 80, -1), mood: MOOD.overcast + 0.5 },
  },
};

export default config;
