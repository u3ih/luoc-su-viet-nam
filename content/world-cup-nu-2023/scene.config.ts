import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Việt Nam (VIET_NAM) tây; play-off (PLAY_OFF) giữa; World Cup (WORLD_CUP) đông.
// Hoạt cảnh trong từng phân cảnh: cột đốm vàng (các chức vô địch Đông Nam Á) cao dần; một đốm xanh nhạt (trận thua ở vòng loại World Cup 2015) lụi; theo thanh kéo, đội tuyển (chấm ngà) đi qua hai trận play-off (đốm vàng) rồi hướng ra biển tới World Cup; ba đốm xanh nhạt lớn (ba đối thủ mạnh) sáng; đội tuyển (ngà) có mặt giữa các đội; các bé gái, nữ sinh (son) ra sân tập ở trường học khắp nơi (đốm ngà)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "dong-nam-a": { ...shot([-200, 0, 40], 75, 200, 110, 1), mood: MOOD.dawn + 0.5 },
    "play-off": { ...shot([40, 0, 0], 85, 240, 120, -1), mood: MOOD.sunset + 0.65 },
    "world-cup": { ...shot([240, 0, 0], 70, 200, 110, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([-200, 0, 40], 80, 220, 120, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
