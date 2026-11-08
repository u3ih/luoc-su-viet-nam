import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { SU_QUAN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh đô (KINH), Sử quán (SU_QUAN), Chương Đức (CHUONG_DUC) tây nam.
// Hoạt cảnh trong từng phân cảnh: đốm ngà đi từ Chương Đức lên kinh đô; các đốm vàng (bia tiến sĩ) dựng lên ở kinh; mười lăm đốm vàng (mười lăm quyển) lần lượt sáng ở Sử quán theo thanh kéo — năm quyển ngoại kỷ, mười quyển bản kỷ; các đốm vàng mới nối thêm vào hàng (những lần bổ sung qua nhiều đời); sử quan (son) đến rồi đi; rất nhiều đốm vàng nhỏ (ván khắc, trang in năm 1697) sáng rực ở Sử quán
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "ngo-si-lien": { ...shot([-120, 0, -80], 60, 300, 140, 1), mood: MOOD.day },
    "muoi-lam-quyen": { ...shot([SU_QUAN[0], 0, SU_QUAN[1]], 80, 170, 70, -1), mood: MOOD.sunset + 0.6 },
    "bo-sung": { ...shot([SU_QUAN[0], 0, SU_QUAN[1]], 70, 200, 90, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([SU_QUAN[0], 0, SU_QUAN[1]], 90, 190, 80, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
