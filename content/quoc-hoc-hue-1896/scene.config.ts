import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { QUOC_HOC } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Hương; Kinh thành bờ bắc; trường Quốc Học (QUOC_HOC) bờ nam.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (chỉ dụ) từ kinh thành sang bờ nam; đốm ngà (trưởng giáo) sáng ở trường; học trò (son) từ khắp nơi tìm về trường theo thanh kéo; ba đốm màu (ba thứ chữ) sáng ở trường; bốn đốm vàng (bốn lần đổi tên) lần lượt sáng rồi mờ; đốm cuối sáng lại tên gốc; nhiều lớp học trò (son) nối nhau qua các thế hệ; đốm vàng sáng ở trường
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "thanh-lap": { ...shot([QUOC_HOC[0], 0, QUOC_HOC[1]], 80, 200, 90, 1), mood: MOOD.day },
    "hoc-tro": { ...shot([QUOC_HOC[0], 0, QUOC_HOC[1]], 90, 220, 100, -1), mood: MOOD.sunset + 0.4 },
    "doi-ten": { ...shot([QUOC_HOC[0], 0, QUOC_HOC[1]], 70, 200, 90, 1), mood: MOOD.overcast + 0.4 },
    "ve-sau": { ...shot([QUOC_HOC[0], 0, QUOC_HOC[1]], 80, 220, 100, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
