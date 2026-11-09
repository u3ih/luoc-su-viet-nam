import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CHO } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thung lũng giữa núi đá; chợ phiên (CHO); các bản.
// Hoạt cảnh trong từng phân cảnh: các bản (đốm ngà) giữa núi đá; người (son) đi trên đường đá; theo thanh kéo, các điểm hóa thạch (đốm vàng nhỏ) lần lượt hiện ra khắp cao nguyên; người từ các bản (son, ngà, xanh nhạt) đổ về chợ phiên (đốm vàng); đốm vàng lớn (công viên địa chất toàn cầu) trên cao nguyên; các bản sáng quanh
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "cao-nguyen": { ...shot([0, 0, 40], 80, 340, 190, 1), mood: MOOD.dawn + 0.5 },
    "hoa-thach": { ...shot([0, 0, 30], 80, 280, 150, -1), mood: MOOD.sunset + 0.6 },
    "dan-toc": { ...shot([CHO[0], 0, CHO[1]], 80, 220, 100, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([0, 0, 40], 85, 320, 180, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
