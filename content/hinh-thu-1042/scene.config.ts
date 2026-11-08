import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH, DIEN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh thành (KINH), điện (DIEN); sông lớn phía đông; các làng quanh kinh.
// Hoạt cảnh trong từng phân cảnh: các nhóm người (son) từ các làng kéo về kinh thành kiện tụng, chen chúc ở cửa thành; các đốm vàng nhỏ (điều khoản) lần lượt sáng thành hàng trong điện theo thanh kéo; đốm vàng lớn (sách Hình thư) sáng ở cuối; các đốm ngà (trạm, quan giám sát) sáng ở các ngả đường quanh kinh; người (son) đi lại yên ổn; hai đốm vàng (lầu chuông) hai bên thềm điện; một người (son) đến đánh chuông, đốm sáng bừng lên
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "kien-tung": { ...shot([KINH[0], 0, KINH[1]], 70, 240, 120, 1), mood: MOOD.overcast + 0.4 },
    "hinh-thu": { ...shot([DIEN[0], 0, DIEN[1]], 80, 140, 60, -1), mood: MOOD.sunset + 0.6 },
    "luat-khac": { ...shot([KINH[0], 0, KINH[1]], 80, 260, 130, 1), mood: MOOD.day },
    "ve-sau": { ...shot([DIEN[0], 0, DIEN[1]], 70, 150, 60, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
