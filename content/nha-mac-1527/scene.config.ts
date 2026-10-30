import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CAO_BANG, THANG_LONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông lớn chảy từ tây bắc xuống đông nam; Thăng Long (THANG_LONG) bên bờ sông ở giữa; Cao Bằng (CAO_BANG) trong núi phía bắc; ải biên giới (AI) ở đông bắc;
// Thanh Hoá (THANH_HOA) ở phía nam. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (người đổ về Thăng Long và đốm sáng nhận ngôi, đốm sáng đi tới ải biên giới, hai phe đi lại ở giữa, quân Lê – Trịnh tiến ra Thăng Long theo thanh kéo rồi đốm Mạc lùi lên phía bắc, ánh lửa ở Cao Bằng)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-300, 190, -300], look: [30, 0, 20], mood: MOOD.dawn + 0.3 },
    "len-ngoi": { ...shot([THANG_LONG[0], 0, THANG_LONG[1]], 90, 210, 100, 1), mood: MOOD.day },
    "nha-minh": { ...shot([140, 0, 190], 90, 280, 150, -1), mood: MOOD.overcast + 0.3 },
    "nam-bac": { ...shot([0, 0, -130], 20, 320, 200, 1), mood: MOOD.overcast + 0.6 },
    "mat-thang-long": { ...shot([THANG_LONG[0] - 10, 0, THANG_LONG[1] - 30], 70, 260, 140, -1), mood: MOOD.dawn + 0.8 },
    "cao-bang": { ...shot([CAO_BANG[0] + 10, 0, CAO_BANG[1]], 100, 150, 150, 1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
