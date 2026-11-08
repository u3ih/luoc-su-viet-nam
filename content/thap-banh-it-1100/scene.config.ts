import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { DOI } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đồi (DOI) giữa đồng; sông phía nam; biển phía đông.
// Hoạt cảnh trong từng phân cảnh: người (son) lên đồi từ phía đông; đốm vàng trên đỉnh đồi; theo thanh kéo, từ chân đồi lên: tháp cổng, tháp đông nam, rồi tháp chính và tháp mái yên ngựa (cột đốm vàng) lần lượt sáng; những đốm ngà nhỏ (hình người, thú, chim) quanh chân tháp mái yên ngựa; bốn cột đốm vàng trên đồi trong ánh chiều
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "ngon-doi": { ...shot([DOI[0], 0, DOI[1]], 90, 260, 110, 1), mood: MOOD.day },
    "bon-thap": { ...shot([DOI[0], 0, DOI[1]], 90, 200, 120, -1), mood: MOOD.sunset + 0.5 },
    "trang-tri": { ...shot([0, 0, 50], 90, 110, 95, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([DOI[0], 0, DOI[1]], 70, 260, 140, -1), mood: MOOD.sunset + 0.55 },
  },
};

export default config;
