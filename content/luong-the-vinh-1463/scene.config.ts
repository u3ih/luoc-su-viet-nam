import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { THIEN_BAN, KINH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thiên Bản (THIEN_BAN) nam, kinh đô (KINH) bắc; các làng giữa.
// Hoạt cảnh trong từng phân cảnh: đốm ngà đi từ Thiên Bản lên kinh đô; ba đốm vàng (Tam khôi) sáng; các đốm vàng (lớp học dùng sách toán) lan dần từ kinh đô ra các làng theo thanh kéo; học trò (son) tụ lại mỗi nơi; một vòng người (son) quây quanh chiếu chèo ở kinh đô; đốm vàng giữa vòng chập chờn; đốm ngà về quê Thiên Bản; đốm vàng nhỏ (cánh diều) bay trên làng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "do-trang": { ...shot([0, 0, 0], 80, 330, 160, 1), mood: MOOD.day },
    "toan-phap": { ...shot([0, 0, 80], 70, 360, 180, -1), mood: MOOD.sunset + 0.4 },
    "cheo": { ...shot([KINH[0], 0, KINH[1]], 80, 200, 90, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([THIEN_BAN[0], 0, THIEN_BAN[1]], 250, 220, 100, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
