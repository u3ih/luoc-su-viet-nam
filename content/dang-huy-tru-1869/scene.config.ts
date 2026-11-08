import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { THANH_HA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Phố Thanh Hà (THANH_HA) bên sông; cửa biển (CUA_BIEN); HUONG_CANG hướng ra biển.
// Hoạt cảnh trong từng phân cảnh: đốm ngà vào trường thi; đốm vàng sáng rồi tắt (bài thi bị đánh hỏng); về sau đốm ngà đi nhậm chức nhiều nơi; chấm ngà theo thuyền ra cửa biển đi xa theo thanh kéo, rồi trở về mang theo đốm vàng (sách, súng); một đốm sáng lóe lên rồi tắt nhiều lần (đèn chụp ảnh) ở phố Thanh Hà; người (son) xếp hàng chờ; các đốm vàng (thương điếm) sáng rồi lịm dần; đốm ngà lịm
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "pham-huy": { ...shot([0, 0, 0], 80, 300, 150, 1), mood: MOOD.overcast + 0.4 },
    "huong-cang": { ...shot([250, 0, -250], 300, 260, 130, -1), mood: MOOD.sunset + 0.6 },
    "hieu-anh": { ...shot([THANH_HA[0], 0, THANH_HA[1]], 80, 150, 60, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([THANH_HA[0], 0, THANH_HA[1]], 80, 220, 100, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
