import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { PHON_XUONG, YEN_THE } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thung lũng Yên Thế (YEN_THE) ở giữa vòng đồi; căn cứ Phồn Xương (PHON_XUONG) ở phía bắc thung lũng; sông ở phía đông; Hà Nội
// (HA_NOI) ở phía nam xa; quanh vùng là các đồn (DON). Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (dân từ các làng lên lập làng, các toán nhỏ đi riêng rồi quy về một người, hai nhóm gặp nhau ở giữa rồi tản, dân tụ về căn cứ, quân từ các đồn
// vây dần, người tản ra các hướng) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [300, 230, -300], look: [-40, 10, 60], mood: MOOD.dawn + 0.3 },
    "yen-the": { ...shot([YEN_THE[0], 0, YEN_THE[1]], 90, 240, 170, 1), mood: MOOD.overcast + 0.3 },
    "nhieu-thu-linh": { ...shot([0, 0, 20], 0, 280, 180, -1), mood: MOOD.day },
    "hoa-hoan": { ...shot([YEN_THE[0], 0, 70], 180, 240, 160, 1), mood: MOOD.sunset - 0.2 },
    "phon-xuong": { ...shot([PHON_XUONG[0], 0, PHON_XUONG[1]], 270, 230, 150, -1), mood: MOOD.dawn + 0.8 },
    "cuoi-cung": { ...shot([YEN_THE[0], 0, 50], 45, 300, 200, 1), mood: MOOD.overcast + 0.6 },
  },
};

export default config;
