import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { GO_MUN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Gò Mun (GO_MUN) giữa các gò đồi; sông Hồng, sông Cầu.
// Hoạt cảnh trong từng phân cảnh: vài chấm ngà (nhà khảo cổ) lên gò; các đốm vàng nhỏ (hiện vật) lộ ra trên gò; người (son) trên các gò xuống đồng trồng lúa, ra sông đánh cá (thuyền chấm ngà); theo thanh kéo, các lò đúc (lửa) lần lượt đỏ trên các gò; đốm vàng (đồ đồng) sáng cạnh lò; chuỗi bốn đốm vàng (Phùng Nguyên – Đồng Đậu – Gò Mun – Đông Sơn) nối nhau theo thời gian, đốm cuối lớn nhất
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "khai-quat": { ...shot([GO_MUN[0], 0, GO_MUN[1]], 80, 160, 60, 1), mood: MOOD.day },
    "lang-go": { ...shot([-60, 0, 20], 70, 280, 140, -1), mood: MOOD.dawn + 0.5 },
    "do-dong": { ...shot([GO_MUN[0], 0, GO_MUN[1]], 80, 170, 70, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([-60, 0, 0], 80, 330, 180, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
