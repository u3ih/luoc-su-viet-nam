import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Bờ biển tây; Hòn Mê (HON_ME) giữa; Vinh (VINH_H) tây nam; vịnh phía đông.
// Hoạt cảnh trong từng phân cảnh: đêm, các thuyền biệt kích (xanh nhạt) từ phía nam lao tới đảo Hòn Mê rồi rút ra; lửa trên đảo; theo thanh kéo, ba tàu phóng lôi (son) từ bờ lao ra phía tàu khu trục (đốm xanh nhạt lớn) ngoài khơi; đêm, hai tàu khu trục (xanh nhạt) ngoài khơi; những đốm xanh lục (tín hiệu ra-đa) loé lên rồi tắt quanh — không có tàu nào; máy bay (đốm xanh nhạt, cách điệu) từ ngoài khơi bay vào bờ; lửa ở các căn cứ và kho dầu Vinh
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "hon-me": { ...shot([50, 0, 100], 90, 200, 100, 1), mood: MOOD.sunset + 0.75 },
    "mung-2": { ...shot([110, 0, 120], 60, 230, 110, -1), mood: MOOD.day },
    "dem-4": { ...shot([180, 0, 0], 0, 220, 100, 1), mood: MOOD.sunset + 0.85 },
    "nghi-quyet": { ...shot([-100, 0, -50], 200, 220, 120, -1), mood: MOOD.dawn + 0.6 },
  },
};

export default config;
