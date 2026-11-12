import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Tuy Hoà (TUY_HOA) tây bắc; TP.HCM (TPHCM) tây; nhà thi đấu (SAN) giữa.
// Hoạt cảnh trong từng phân cảnh: đốm vàng nhỏ (cô bé) ở Tuy Hoà; một nhóm trẻ (son) tập võ quanh; chấm ngà rời Tuy Hoà vào TP.HCM; những huy chương (cột đốm ngà rồi vàng) cao dần; theo thanh kéo, chấm ngà đi qua các trận (đốm xanh nhạt) tới bục nhận huy chương; đốm ngà (huy chương bạc) sáng; đốm ngà (bạc 2000) sáng; mười sáu năm sau đốm vàng (vàng 2016) sáng bên cạnh; vòng khán giả (son)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "tuy-hoa": { ...shot([-220, 0, 150], 70, 200, 110, 1), mood: MOOD.dawn + 0.5 },
    "thanh-tich": { ...shot([-120, 0, 40], 80, 240, 130, -1), mood: MOOD.sunset + 0.55 },
    "sydney": { ...shot([40, 0, 0], 90, 170, 80, 1), mood: MOOD.sunset + 0.75 },
    "ve-sau": { ...shot([40, 0, 0], 85, 200, 110, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
