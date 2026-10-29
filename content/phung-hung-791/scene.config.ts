import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { DUONG_LAM, TONG_BINH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Vùng đồi ở tây bắc; sông lớn chảy từ tây bắc xuống đông nam; Đường Lâm (DUONG_LAM) ở rìa đồi phía tây bắc; Tống Bình (TONG_BINH) bên bờ sông ở giữa. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: các nhóm người (son) từ làng quanh tụ về Đường Lâm, một đốm ngà sáng dần, lửa bật lên; các nhóm người (son) từ Đường Lâm và các làng khác tụ về Tống Bình theo thanh kéo; đốm xanh nhạt sáng ở Tống Bình; một quầng ngà sáng dần ở Tống Bình, các nhóm người (son) đến đứng quanh; các đốm sáng mờ ở ba nơi (các chỗ nguồn khác nhau) sáng dần rồi dịu lại
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-300,190,-280], look: [-40,0,40], mood: MOOD.dawn + 0.3 },
    "duong-lam": { ...shot([DUONG_LAM[0], 0, DUONG_LAM[1]], 20, 210, 120, 1), mood: MOOD.day },
    "nam-791": { ...shot([TONG_BINH[0], 0, TONG_BINH[1]], 150, 250, 140, -1), mood: MOOD.overcast + 0.7 },
    "bo-cai": { ...shot([TONG_BINH[0], 0, TONG_BINH[1]], 110, 220, 110, 1), mood: MOOD.dawn + 0.8 },
    "nguon-su": { ...shot([DUONG_LAM[0], 0, DUONG_LAM[1]], 160, 230, 120, -1), mood: MOOD.sunset },
  },
};

export default config;
