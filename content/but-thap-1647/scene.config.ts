import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CHUA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Đuống phía bắc; chùa (CHUA) dưới đê; kinh thành (KINH) tây.
// Hoạt cảnh trong từng phân cảnh: đốm vàng mờ ở ngôi chùa cũ bên đê; vài người (son) qua lại; một đốm ngà (bà hoàng) từ kinh thành về chùa; thợ (son) tụ về; các đốm vàng (gian nhà) sáng dần theo trục chùa theo thanh kéo; một vầng đốm vàng nhỏ xòe ra như nghìn tay quanh một đốm sáng giữa; các đốm ngà nhỏ (bức chạm đá) quanh lan can; người (son) về dự hội chùa; đốm vàng sáng ở chùa
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "ninh-phuc": { ...shot([CHUA[0], 0, CHUA[1]], 80, 200, 90, 1), mood: MOOD.day },
    "trung-tu": { ...shot([CHUA[0], 0, CHUA[1]], 70, 170, 70, -1), mood: MOOD.overcast + 0.3 },
    "quan-am": { ...shot([CHUA[0], 0, CHUA[1]], 90, 120, 45, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([CHUA[0], 0, CHUA[1]], 70, 200, 90, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
