import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Côn Sơn (CON_SON) đông bắc, kinh đô (KINH) giữa; biển phía đông. Các đốm vùng là tượng trưng.
// Hoạt cảnh trong từng phân cảnh: đốm ngà rời Côn Sơn về kinh đô; đốm vàng (vua) ở kinh; các đốm vàng (núi, sông, biển, các vùng) lần lượt sáng khắp toàn cảnh theo thanh kéo; bốn đốm ngà (những người chú giải) lần lượt sáng quanh đốm vàng (sách) ở kinh đô; đốm vàng (bản khắc) lịm đi; về sau một đốm vàng nhỏ (bản sách còn sót) sáng lại
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "trieu-ra": { ...shot([60, 0, 150], 60, 300, 150, 1), mood: MOOD.day },
    "dang-sach": { ...shot([0, 0, 0], 80, 360, 200, -1), mood: MOOD.sunset + 0.25 },
    "chu-giai": { ...shot([KINH[0], 0, KINH[1]], 80, 200, 90, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([KINH[0], 0, KINH[1]], 70, 200, 90, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
