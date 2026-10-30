import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HAM_TU, CHUONG_DUONG, TAY_KET, GIA_LAM, THANG_LONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông lớn chảy từ tây bắc xuống đông nam; Thăng Long (THANG_LONG), Chương Dương (CHUONG_DUONG), Hàm Tử (HAM_TU), Tây Kết (TAY_KET) lần lượt về phía đông nam; bờ bắc sông (GIA_LAM); hướng rút của quân Nguyên (VINH_BINH) ở tây bắc. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: đoàn ngà đi tới Hàm Tử, đốm xanh nhạt (quân Nguyên) ở đó mờ dần khi đoàn tới; đoàn ngà đi từ Chương Dương lên Thăng Long, đoàn xanh nhạt rút sang bờ bắc; đoàn thuyền ngà tiến tới Tây Kết theo thanh kéo; đốm xanh nhạt ở Tây Kết mờ dần khi đoàn tới; đoàn xanh nhạt rút về phía tây bắc, đoàn ngà đuổi theo; vài đốm vàng sáng dọc đường (các trận truy kích); ba đốm vàng sáng dịu ở ba nơi (các chỗ nguồn khác nhau), vài nhóm người (son) trở về
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [330,190,-300], look: [0,0,40], mood: MOOD.dawn + 0.3 },
    "ham-tu": { ...shot([HAM_TU[0], 0, HAM_TU[1]], 150, 240, 130, 1), mood: MOOD.overcast + 0.3 },
    "chuong-duong": { ...shot([CHUONG_DUONG[0], 0, CHUONG_DUONG[1]], 100, 220, 110, -1), mood: MOOD.dawn + 0.8 },
    "tay-ket": { ...shot([TAY_KET[0], 0, TAY_KET[1]], 20, 250, 130, 1), mood: MOOD.sunset - 0.2 },
    "truy-kich": { ...shot([GIA_LAM[0], 0, GIA_LAM[1]], 60, 280, 160, -1), mood: MOOD.overcast + 0.4 },
    "so-lieu": { ...shot([THANG_LONG[0], 0, THANG_LONG[1]], 150, 300, 200, 1), mood: MOOD.sunset },
  },
};

export default config;
