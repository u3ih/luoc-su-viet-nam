import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { NUI_BAI_THO, VACH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Núi Bài Thơ (NUI_BAI_THO) sát biển; cửa sông Bạch Đằng (CUA_SONG) phía tây; vịnh nhiều đảo đá phía nam.
// Hoạt cảnh trong từng phân cảnh: lửa báo (lửa) bật trên đỉnh núi Truyền Đăng rồi lan dọc đất liền về phía tây bắc; theo thanh kéo, đoàn thuyền (đốm vàng) từ cửa sông Bạch Đằng ra biển, tới chân núi; quân (son) dừng dưới chân núi; đốm vàng (bài thơ) sáng trên vách đá; mười hai đốm ngà (mười hai bài thơ) lần lượt sáng quanh vách núi
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "truyen-dang": { ...shot([NUI_BAI_THO[0], 0, NUI_BAI_THO[1]], 80, 260, 120, 1), mood: MOOD.sunset + 0.7 },
    "tuan-du": { ...shot([-80, 0, -30], 90, 320, 150, -1), mood: MOOD.dawn + 0.5 },
    "khac-tho": { ...shot([VACH[0], 0, VACH[1]], 85, 150, 50, 1), mood: MOOD.sunset + 0.55 },
    "ve-sau": { ...shot([NUI_BAI_THO[0], 0, NUI_BAI_THO[1]], 80, 220, 100, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
