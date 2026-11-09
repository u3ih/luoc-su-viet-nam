import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { THAP } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Tháp Yang Prong (THAP) giữa rừng bên sông Ea H'leo.
// Hoạt cảnh trong từng phân cảnh: người Chăm (son) băng rừng tới nơi dựng tháp; đốm vàng (nơi thờ Thần Lớn); theo thanh kéo, cột đốm vàng (tháp gạch) cao dần giữa rừng; vài chấm ngà (nhà nghiên cứu) men sông tới tháp; đốm ngà (bia ký) trên cửa và dấu dinh thự xưa quanh tháp; ngọn tháp (cột vàng) giữa rừng chiều; khách (son) tới tham quan
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "than-lon": { ...shot([THAP[0], 0, THAP[1]], 80, 200, 80, 1), mood: MOOD.dawn + 0.5 },
    "xay-thap": { ...shot([THAP[0], 0, THAP[1]], 80, 150, 60, -1), mood: MOOD.sunset + 0.6 },
    "phat-hien": { ...shot([-40, 0, 50], 80, 230, 90, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([THAP[0], 0, THAP[1]], 85, 180, 75, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
