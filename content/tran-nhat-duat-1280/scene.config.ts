import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { BA_GIA, KINH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Đà giữa núi; doanh trại (DOANH) đông, trại Giác Mật (TRAI) tây; thôn Bà Già (BA_GIA), kinh đô (KINH) xa phía đông.
// Hoạt cảnh trong từng phân cảnh: đốm ngà (Chiêu Văn vương) đi thăm thôn Bà Già; người làng (son) ra đón, ở lại vài ngày; trại Giác Mật (xanh nhạt) ở phía tây giữa núi; doanh trại triều đình (son) dựng ở phía đông; đốm ngà ở doanh trại; đốm ngà cùng vài người hầu (son) rời doanh trại đi vào trại Giác Mật theo thanh kéo; người trại (xanh nhạt) vây vòng rồi tụ quanh trò chuyện; đoàn người (xanh nhạt và son) theo đốm ngà xuôi về kinh đô; đốm vàng ở kinh đô
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "nhieu-tieng": { ...shot([BA_GIA[0], 0, BA_GIA[1]], 300, 220, 110, 1), mood: MOOD.day },
    "da-giang": { ...shot([0, 0, 100], 90, 330, 180, -1), mood: MOOD.overcast + 0.4 },
    "mot-ngua": { ...shot([0, 0, 110], 90, 300, 160, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([KINH[0], 0, KINH[1]], 20, 240, 130, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
