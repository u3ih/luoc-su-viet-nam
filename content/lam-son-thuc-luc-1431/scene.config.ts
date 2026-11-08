import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Lam Sơn (LAM_SON) tây nam; Nghệ An (NGHE_AN) nam; kinh đô (KINH) đông bắc.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (vua) ở kinh đô; đốm ngà (người chép sách) bên cạnh; theo thanh kéo, một vệt đốm sáng đi ba chặng: từ Lam Sơn (son), xuống Nghệ An (vàng), rồi ra kinh đô (ngà); đốm vàng (lời tựa) sáng dịu ở kinh; đốm son mờ (những ngày gian khổ) ở Lam Sơn xa; sáu đốm ngà nhỏ (sáu bản chép tay) xếp quanh
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "boi-canh": { ...shot([KINH[0], 0, KINH[1]], 60, 200, 90, 1), mood: MOOD.day },
    "ba-phan": { ...shot([0, 0, -40], 270, 360, 230, -1), mood: MOOD.sunset + 0.4 },
    "loi-tua": { ...shot([KINH[0], 0, KINH[1]], 70, 160, 60, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([KINH[0], 0, KINH[1]], 80, 200, 90, -1), mood: MOOD.sunset + 0.55 },
  },
};

export default config;
