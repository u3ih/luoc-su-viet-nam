import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { LANG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Làng (LANG) bên sông; đường ra biên ải (BIEN_AI) ở phía bắc.
// Hoạt cảnh trong từng phân cảnh: đêm ở làng, một đốm ngà nhỏ (người chinh phụ) bên ánh đèn; các đốm vàng nhỏ (câu thơ) hiện dần; đoàn quân (son) qua cầu rời làng đi về biên ải, xa dần theo thanh kéo; một đốm ngà đứng lại ở đầu cầu; bảy đốm ngà (bảy bản dịch) sáng lần lượt quanh làng; trời rạng; một đốm ngà ở đầu cầu vẫn chờ; xa xa nơi biên ải một đốm vàng mờ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "nguyen-tac": { ...shot([LANG[0], 0, LANG[1]], 80, 200, 90, 1), mood: MOOD.sunset + 0.6 },
    "tien-dua": { ...shot([0, 0, 40], 90, 320, 140, -1), mood: MOOD.sunset + 0.4 },
    "ban-dich": { ...shot([LANG[0], 0, LANG[1]], 90, 180, 80, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([0, 0, 0], 90, 300, 140, -1), mood: MOOD.dawn + 0.4 },
  },
};

export default config;
