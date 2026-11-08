import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH, VAN_MIEU } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh thành (KINH); Văn Miếu (VAN_MIEU) phía nam.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (vua) trong hoàng thành; các đốm ngà (các vệ, các phủ) sáng thành vòng quanh; theo thanh kéo, sĩ tử (son) từ các trấn đổ về kinh thành; 28 đốm vàng nhỏ (người trúng tuyển) sáng; ba đợt đốm vàng (các khoa 1532, 1535, 1538), mỗi đợt có một đốm sáng hơn (người đỗ đầu); hàng đốm ngà (bia tiến sĩ) ở Văn Miếu
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "dinh-phep": { ...shot([KINH[0], 0, KINH[1]], 80, 230, 120, 1), mood: MOOD.day },
    "khoa-thi": { ...shot([0, 0, -20], 80, 300, 160, -1), mood: MOOD.dawn + 0.5 },
    "cac-khoa": { ...shot([KINH[0], 0, KINH[1]], 70, 200, 90, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([VAN_MIEU[0], 0, VAN_MIEU[1]], 80, 150, 50, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
