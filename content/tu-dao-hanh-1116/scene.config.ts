import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CHUA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Núi Sài Sơn (SAI_SON); hang (HANG); chùa (CHUA) dưới chân núi; hồ Long Chiểu trước chùa; làng Láng (LANG) đông.
// Hoạt cảnh trong từng phân cảnh: đốm ngà (Từ Lộ) rời làng Láng đi về phía tây nam, nửa đường quay lại, lên núi Sài Sơn; theo thanh kéo, am nhỏ (đốm ngà) rồi chùa Cao trên núi, chùa Cả dưới chân núi và các toà quanh hồ (đốm vàng) lần lượt sáng; người phi ngựa (đốm vàng) từ kinh thành tới núi; đốm ngà ở hang lịm đi; đốm vàng (người con ra đời) sáng ở phía đông; hội chùa Thầy: người (son) đông quanh hồ; đốm vàng (thủy đình) giữa hồ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "sai-son": { ...shot([100, 0, -60], 80, 260, 140, 1), mood: MOOD.dawn + 0.5 },
    "chua-thay": { ...shot([0, 0, 20], 80, 220, 100, -1), mood: MOOD.sunset + 0.6 },
    "trut-xac": { ...shot([60, 0, 20], 80, 260, 120, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([CHUA[0], 0, CHUA[1]], 85, 190, 80, -1), mood: MOOD.sunset + 0.55 },
  },
};

export default config;
