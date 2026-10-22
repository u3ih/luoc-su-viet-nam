import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HALL } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh đô và chỗ đặt điện Diên Hồng ở gốc toạ độ (HALL), sông lớn chảy phía đông (x ≈ 170), sông nhỏ phía tây;
// tám nơi các bô lão về (PLACES) rải quanh trên đồng bằng. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (sứ nhà Nguyên tới rồi đi, hai đạo quân tiến sát biên giới, sứ giả đi mời và các bô lão kéo về, vòng người quanh điện và tiếng đáp,
// tin lan khắp các làng, quân Nguyên tiến xuống còn quân Trần rút) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [230, 100, -270], look: [0, 6, 20], mood: MOOD.dawn + 0.2 },
    "moi-be": { ...shot([0, 0, 110], 90, 270, 140, 1), mood: MOOD.overcast + 0.3 },
    "ap-sat": { ...shot([90, 0, 0], 100, 430, 270, -1, 0.15), mood: MOOD.overcast, fov: 52 },
    "trieu-tap": { ...shot([HALL[0], 0, HALL[1]], 20, 330, 190, 1, 0.2), mood: MOOD.day - 0.5 },
    "dien-hong": { ...shot([HALL[0], 6, HALL[1]], 200, 115, 48, -1, 0.3), mood: MOOD.sunset - 0.4 },
    "ve-lang": { ...shot([HALL[0], 0, HALL[1]], 330, 340, 200, 1, 0.2), mood: MOOD.sunset + 0.2 },
    "mo-man": { ...shot([40, 0, 70], 80, 380, 220, -1, 0.2), mood: MOOD.overcast + 0.2 },
  },
};

export default config;
