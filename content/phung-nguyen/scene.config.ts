import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { FURNACE, KILN, MAN_BAC, MOUND, WORKSHOP } from "./places";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem places.ts, terrain.ts): sông lớn chảy từ tây sang đông qua gần gốc toạ độ, sông nhánh nhập vào từ phía bắc;
// doi đất "làng" ở khoảng (-120, 80) bên bờ bắc; doi đất có dải đồi vòng cung bao quanh ("Mán Bạc") ở khoảng (-200, -140) bên bờ nam.
// nung: 0 = gốm mộc, 1 = lửa nung đã bén (người xem kéo ở phân cảnh "gom").
// Hoạt cảnh trong từng phân cảnh (đốm sáng nơi khai quật, bếp lửa trong làng, đoàn người ra sông, hố nung gốm, vòng đá hiện dần,
// lò luyện đồng, đoàn người đi về Mán Bạc, dòng chảy tới các văn hoá sau) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: { nung: 0 },
  keyframes: {
    "mo-dau": { cam: [230, 100, -215], look: [-90, 6, 70], mood: MOOD.dawn + 0.2 },
    "phat-hien": { ...shot([MOUND[0], 6, MOUND[1]], 105, 150, 52, 1), mood: MOOD.dawn + 0.5 },
    "thoi-gian": { ...shot([MOUND[0] + 8, 4, MOUND[1] - 18], 40, 140, 62, -1, 0.25), mood: MOOD.dawn + 0.85 },
    "ven-song": { ...shot([-10, 0, 25], 100, 230, 130, 1, 0.25), mood: MOOD.dawn + 0.8 },
    "gom": { ...shot([KILN[0], 4, KILN[1]], 330, 75, 22, -1), mood: MOOD.overcast + 0.15, fov: 48, params: { nung: 0 } },
    "da-ngoc": { ...shot([WORKSHOP[0], 5, WORKSHOP[1]], 200, 80, 26, 1), mood: MOOD.overcast - 0.1, fov: 48, params: { nung: 0 } },
    "dong": { ...shot([FURNACE[0], 5, FURNACE[1]], 60, 85, 24, -1), mood: MOOD.sunset - 0.1, fov: 48 },
    "mo-tang": { ...shot([MAN_BAC[0], 4, MAN_BAC[1]], 270, 105, 38, 1), mood: MOOD.sunset + 0.55 },
    "noi-tiep": { ...shot([40, 0, 15], 80, 270, 140, -1, 0.25), mood: MOOD.dawn + 0.35 },
  },
};

export default config;
