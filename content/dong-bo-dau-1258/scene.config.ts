import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { SONG_THAO, BINH_LE, DONG_BO_DAU, THANG_LONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông lớn chảy từ tây bắc xuống đông nam; Thăng Long (THANG_LONG) bên bờ sông; bến Đông Bộ Đầu (DONG_BO_DAU) ở đông nam; Bình Lệ Nguyên (BINH_LE) ở phía bắc; hướng quân Mông Cổ tới (SONG_THAO) ở tây bắc; sông Thiên Mạc (THIEN_MAC) ở phía nam. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: đoàn xanh nhạt (quân Mông Cổ) từ vùng đồi phía tây bắc xuống đồng bằng; một đốm ngà sáng ở Thăng Long; đoàn ngà (quân Trần) tập hợp ở Bình Lệ Nguyên, đoàn xanh nhạt tiến tới, đoàn ngà rút dần về phía Thăng Long rồi bỏ thành; đoàn thuyền ngà ngược sông tới bến Đông Bộ Đầu theo thanh kéo, đoàn xanh nhạt ở Thăng Long mờ dần rồi rút về phía tây bắc; quầng ngà dịu ở Thăng Long, các nhóm người (son) trở về đứng quanh, lửa bật dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [330,190,-300], look: [-40,0,80], mood: MOOD.dawn + 0.3 },
    "boi-canh": { ...shot([SONG_THAO[0], 0, SONG_THAO[1]], 20, 250, 160, 1), mood: MOOD.overcast + 0.4 },
    "binh-le": { ...shot([BINH_LE[0], 0, BINH_LE[1]], 160, 250, 130, -1), mood: MOOD.dawn + 0.8 },
    "dong-bo-dau": { ...shot([DONG_BO_DAU[0], 0, DONG_BO_DAU[1]], 140, 230, 110, 1), mood: MOOD.night - 0.2 },
    "sau-tran": { ...shot([THANG_LONG[0], 0, THANG_LONG[1]], 110, 230, 120, -1), mood: MOOD.sunset },
  },
};

export default config;
