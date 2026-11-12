import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (TRUONG) giữa; các nơi tuyển sinh phía nam, tây; triển lãm (TRIEN_LAM) tây bắc.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (trường) sáng ở Hà Nội; sinh viên (son) tụ về; năm nơi tuyển sinh (đốm xanh nhạt) cùng sáng; bài thi (chấm ngà) từ các nơi gửi về Hà Nội; theo thanh kéo, tranh (chấm vàng) lên đường từ Hà Nội tới các phòng triển lãm (đốm ngà) ở góc tây bắc, sáng lần lượt; sinh viên (son) rời Hà Nội chia ba ngả: Phủ Lý, Sơn Tây, Đà Lạt; đốm vàng của trường tắt (1945)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "thanh-lap": { ...shot([0, 0, 40], 80, 200, 100, 1), mood: MOOD.dawn + 0.5 },
    "thi-tuyen": { ...shot([20, 0, -120], 80, 230, 130, -1), mood: MOOD.dawn + 0.5 },
    "trien-lam": { ...shot([-140, 0, 160], 110, 270, 150, 1), mood: MOOD.sunset + 0.65 },
    "so-tan": { ...shot([30, 0, -60], 80, 270, 160, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
