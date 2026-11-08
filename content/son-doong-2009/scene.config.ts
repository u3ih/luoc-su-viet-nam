import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CUA_HANG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Cửa hang (CUA_HANG) sườn núi; bìa rừng (BIA_RUNG); hai giếng trời (GIENG_*).
// Hoạt cảnh trong từng phân cảnh: mưa (đốm xanh nhạt rơi) trên rừng; một chấm (người đi rừng) trú vào cửa hang; theo thanh kéo, đoàn thám hiểm (chấm ngà, có đèn) băng rừng từ bìa rừng tới cửa hang; cột đốm sáng cao vọt (vòm hang hơn 200 m) ở cửa hang; đốm xanh dài (sông ngầm); hai luồng sáng (giếng trời) rọi xuống rừng trong hang
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "ho-khanh": { ...shot([CUA_HANG[0], 0, CUA_HANG[1]], 90, 200, 70, 1), mood: MOOD.overcast + 0.5 },
    "tham-hiem": { ...shot([-100, 0, -120], 330, 300, 170, -1), mood: MOOD.dawn + 0.5 },
    "kich-thuoc": { ...shot([CUA_HANG[0], 0, CUA_HANG[1]], 90, 180, 40, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([60, 0, 180], 90, 360, 280, -1), mood: MOOD.day },
  },
};

export default config;
