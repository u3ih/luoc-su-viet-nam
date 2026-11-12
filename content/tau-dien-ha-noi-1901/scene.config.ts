import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Bờ hồ (BO_HO) giữa; Cầu Giấy (CAU_GIAY) tây; Bưởi (BUOI) tây bắc; Hà Đông (HA_DONG) tây nam; Bạch Mai (BACH_MAI) nam.
// Hoạt cảnh trong từng phân cảnh: ba đường đốm ngà mờ (ba tuyến quy hoạch) toả ra từ bờ hồ tới Bạch Mai, làng Giấy, Thái Hà ấp; theo thanh kéo, đoàn tàu điện (chấm vàng) chạy từ bờ hồ ra Cầu Giấy; khách (son) chờ ở ga; mạng lưới lan rộng: các tuyến (đốm ngà) kéo ra chợ Bưởi, Hà Đông, Bạch Mai; nhiều đoàn tàu (chấm vàng) chạy; các tuyến tắt dần; một đốm vàng cuối cùng ở bờ hồ lụi đi (1991)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "do-an": { ...shot([-40, 0, 20], 80, 270, 160, 1), mood: MOOD.dawn + 0.5 },
    "khanh-thanh": { ...shot([-60, 0, 30], 60, 240, 120, -1), mood: MOOD.sunset + 0.6 },
    "mo-rong": { ...shot([-60, 0, 0], 80, 270, 160, 1), mood: MOOD.sunset + 0.65 },
    "dung-lai": { ...shot([100, 0, 20], 80, 190, 100, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
