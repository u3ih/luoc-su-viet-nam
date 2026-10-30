import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { GIANH_MID, NGUYEN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông, núi ở phía tây; sông Gianh (GIANH_MID) chảy ngang giữa dải đất; sông Nhật Lệ (NHAT_LE) ở phía nam; kinh đô phía bắc (TRINH) và phía nam (NGUYEN). Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (hai đốm sáng hai miền và người đi lại, đoàn quân từ bắc vào nam rồi rút, bảy đốm vàng sáng lần lượt, dải đốm vạch ranh giới sông Gianh theo thanh kéo, quân từ bắc tiến xuống Phú Xuân)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [320, 180, -320], look: [-30, 0, 20], mood: MOOD.dawn + 0.3 },
    "hai-mien": { ...shot([30, 0, 20], 150, 380, 220, 1), mood: MOOD.day },
    "nam-1627": { ...shot([60, 0, -120], 165, 240, 130, -1), mood: MOOD.overcast + 0.4 },
    "cac-tran": { ...shot([40, 0, 0], 200, 330, 220, 1), mood: MOOD.overcast + 0.8 },
    "song-gianh": { ...shot([GIANH_MID[0], 0, GIANH_MID[1]], 150, 250, 130, -1), mood: MOOD.dawn + 0.8 },
    "ve-sau": { ...shot([NGUYEN[0], 0, NGUYEN[1] + 30], 170, 260, 130, 1), mood: MOOD.sunset },
  },
};

export default config;
