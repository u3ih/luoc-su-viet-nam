import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Đà ngang cảnh, chảy về phía đông; đập (DAP) giữa; lòng hồ phía tây.
// Hoạt cảnh trong từng phân cảnh: các đoàn chuyên gia (chấm ngà) lần theo sông Đà khảo sát; điểm đặt đập (đốm ngà); dân các bản ven sông phía thượng lưu (son) dời lên các khu tái định cư trên đồi (đốm ngà); theo thanh kéo, con đập (khối tường) dâng lên chắn ngang sông; công nhân (son) trên đập; sáu tổ máy (đốm vàng) lần lượt sáng; dòng điện (chuỗi đốm vàng) toả về phía đông
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,180,-280], look: [0,0,0], mood: MOOD.dawn + 0.3 },
    "khao-sat": { ...shot([0, 0, 0], 80, 230, 120, 1), mood: MOOD.dawn + 0.5 },
    "tai-dinh-cu": { ...shot([-180, 0, 40], 90, 280, 180, -1), mood: MOOD.sunset + 0.55 },
    "dap": { ...shot([0, 0, 0], 30, 200, 110, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([40, 0, 0], 20, 260, 130, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
