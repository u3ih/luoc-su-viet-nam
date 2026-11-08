import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CHUA, NEN_2 } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Núi (DINH_NUI) bắc; chùa (CHUA) sườn nam, ba cấp nền (NEN_1..3); sông phía nam.
// Hoạt cảnh trong từng phân cảnh: người (son) lên sườn núi xây chùa; đốm vàng (tháp) sáng trên sườn; theo thanh kéo, ba hàng đốm vàng (ba cấp nền) lần lượt sáng từ thấp lên cao; hàng đốm ngà (tượng thú đá) ở cấp hai; một đốm vàng lớn, dịu (tượng A Di Đà) sáng ở giữa; đốm vàng xa trên sườn (chữ Phật khắc đá); lửa bùng (chùa bị đốt năm 1947) rồi tắt; đốm vàng (tượng) vẫn còn, sau đó vài đốm (chùa dựng lại) sáng lên
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "khoi-dung": { ...shot([CHUA[0], 0, CHUA[1]], 90, 220, 90, 1), mood: MOOD.day },
    "ba-cap-nen": { ...shot([CHUA[0], 0, CHUA[1]], 90, 170, 60, -1), mood: MOOD.sunset + 0.5 },
    "tuong-phat": { ...shot([NEN_2[0], 0, NEN_2[1]], 90, 120, 40, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([CHUA[0], 0, CHUA[1]], 70, 220, 90, -1), mood: MOOD.sunset + 0.55 },
  },
};

export default config;
