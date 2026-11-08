import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { NHA_THO, BEN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Nhà thờ (NHA_THO) giữa; bến (BEN) bên sông phía đông.
// Hoạt cảnh trong từng phân cảnh: tàu (chấm ngà) cập bến chở vật liệu từ Pháp; người (son) khuân vác về khu đất; đốm ngà (viên đá đầu tiên), rồi các đốm hồng (gạch) xếp dần thành khối theo thanh kéo; hai cột đốm vàng (hai tháp chuông) mọc cao dần; đốm ngà (tượng) trước nhà thờ; người (son) qua lại quảng trường
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "do-an": { ...shot([BEN[0], 0, BEN[1]], 120, 200, 90, 1), mood: MOOD.day },
    "xay-dung": { ...shot([NHA_THO[0], 0, NHA_THO[1]], 80, 160, 60, -1), mood: MOOD.overcast + 0.3 },
    "thap-chuong": { ...shot([NHA_THO[0], 0, NHA_THO[1]], 80, 150, 50, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([NHA_THO[0], 0, NHA_THO[1]], 70, 200, 80, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
