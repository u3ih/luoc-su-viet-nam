import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { DONG_HO } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Làng Đông Hồ (DONG_HO) bên sông Đuống, bến (BEN); LANG_A, LANG_B là các làng khác.
// Hoạt cảnh trong từng phân cảnh: người làng (son) đi lại giữa các nhà; đốm vàng sáng ở làng Đông Hồ; những đốm trắng ngà lấp lánh (giấy điệp) phơi thành hàng dài; theo thanh kéo, từng lớp màu (đen, vàng, đỏ) in chồng lên nền điệp: các đốm màu lần lượt sáng trên hàng tranh; người các làng (son) về Đông Hồ mua tranh rồi mang đi (dịp Tết); đốm vàng ở mỗi làng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "lang-tranh": { ...shot([DONG_HO[0], 0, DONG_HO[1]], 80, 220, 100, 1), mood: MOOD.day },
    "giay-diep": { ...shot([DONG_HO[0], 0, DONG_HO[1]], 100, 150, 60, -1), mood: MOOD.day },
    "in-mau": { ...shot([DONG_HO[0], 0, DONG_HO[1]], 80, 140, 55, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([0, 0, -150], 270, 330, 160, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
