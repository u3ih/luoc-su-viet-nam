import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { FURNACE, GRAVES, JADE, LAKE, POTTERY, SITE } from "./places";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem places.ts, terrain.ts): sông lớn chảy phía nam (z ≈ -140), đầm nước ở khoảng (135, 55), gò làng rộng ở khoảng (-40, 40),
// lò đúc đồng ở (-62, 22), khu mộ ở (-125, 112).
// duc: 0 = khuôn trống, 1 = đã rót đồng (người xem kéo ở phân cảnh "duc-dong").
// Hoạt cảnh trong từng phân cảnh (các hố khai quật hiện dần, 42 đốm sáng di tích, nền nhà và bếp lửa, lò đúc đồng, lò gốm, ruộng và
// gia súc, đoàn người đi về khu mộ, dòng chảy tới các văn hoá sau) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: { duc: 0 },
  keyframes: {
    "mo-dau": { cam: [270, 110, -215], look: [-30, 5, 45], mood: MOOD.dawn + 0.2 },
    "phat-hien": { ...shot([SITE[0], 6, SITE[1]], 105, 150, 55, 1), mood: MOOD.dawn + 0.5 },
    "dia-ban": { ...shot([20, 0, 10], 95, 230, 125, -1, 0.25), mood: MOOD.dawn + 0.85 },
    "nen-nha": { ...shot([SITE[0] - 8, 6, SITE[1] + 12], 150, 105, 42, 1), mood: MOOD.dawn + 0.7 },
    "duc-dong": { ...shot([FURNACE[0] + 8, 5, FURNACE[1] + 4], 30, 70, 22, -1), mood: MOOD.overcast + 0.4, fov: 48, params: { duc: 0 } },
    "gom-da": { ...shot([(POTTERY[0] + JADE[0]) / 2, 5, POTTERY[1] - 2], 250, 120, 34, 1), mood: MOOD.overcast - 0.2, params: { duc: 0 } },
    "kinh-te": { ...shot([LAKE[0] - 80, 2, LAKE[1] - 4], 0, 120, 42, -1), mood: MOOD.dawn + 0.6 },
    "tuc-le": { ...shot([GRAVES[0], 4, GRAVES[1]], 340, 140, 50, 1), mood: MOOD.night - 0.35 },
    "noi-tiep": { ...shot([20, 0, -25], 80, 280, 145, -1, 0.25), mood: MOOD.dawn + 0.35 },
  },
};

export default config;
