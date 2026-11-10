import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thung lũng Cao Bằng; thành (CAO_BANG) giữa; đường về Thăng Long phía nam.
// Hoạt cảnh trong từng phân cảnh: hoàng tộc nhà Mạc (ngà) rời phương nam, theo thung lũng lên miền núi Cao Bằng; thành Cao Bằng hiện lên; ba đời Mạc (đốm vàng) nối nhau; dân (son) quanh thành; theo thanh kéo, quân Lê – Trịnh (xanh nhạt) tiến lên thung lũng tới thành; vài chấm ngà chạy về phía bắc; lửa bùng ở thành; thành Cao Bằng dưới quyền triều Lê – Trịnh (đốm xanh nhạt); phương bắc xa (đốm ngà lịm dần)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "roi-thang-long": { ...shot([30, 0, -30], 85, 300, 180, 1), mood: MOOD.dawn + 0.5 },
    "cao-bang": { ...shot([-20, 0, 110], 80, 210, 110, -1), mood: MOOD.sunset + 0.55 },
    "that-thu": { ...shot([20, 0, 40], 85, 300, 170, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([-20, 0, 140], 80, 260, 140, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
