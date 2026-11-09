import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { SAN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sân hội (SAN) giữa làng; rừng đồi phía tây; biển phía đông.
// Hoạt cảnh trong từng phân cảnh: chòi canh (đốm ngà) dọc bìa rừng; thú dữ (xanh nhạt) từ rừng xuống ruộng rồi bị xua về; theo thanh kéo, mười chòi hai bên và chòi mẹ ở giữa (đốm vàng) lần lượt sáng; dân (son) tụ về sân hội; anh hiệu (đốm ngà) đi giữa hai dãy chòi hô thai; chòi trúng (đốm vàng) sáng lên; hội chòi sáng rực; người (son) quây quanh sân hội
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "choi-canh": { ...shot([-170, 0, 40], 70, 300, 120, 1), mood: MOOD.sunset + 0.7 },
    "hoi-choi": { ...shot([SAN[0], 0, SAN[1]], 80, 140, 55, -1), mood: MOOD.sunset + 0.6 },
    "ho-thai": { ...shot([SAN[0], 0, SAN[1]], 75, 120, 45, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([SAN[0], 0, SAN[1]], 85, 200, 85, -1), mood: MOOD.sunset + 0.55 },
  },
};

export default config;
