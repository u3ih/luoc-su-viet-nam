import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { VIEN, DON_THUY } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Viện (VIEN) giữa; sông Hồng phía đông; Đồn Thủy (DON_THUY) bên sông.
// Hoạt cảnh trong từng phân cảnh: đốm ngà (nghị định) sáng ở giữa; theo thanh kéo, năm đốm vàng (năm trường) từ năm nơi dồn về viện; 94 chấm (sinh viên, son) tụ về cơ sở cạnh Đồn Thủy; đốm vàng sáng rồi tắt (tạm dừng); đốm vàng sáng lại (năm 1917); dòng sinh viên (son) đông dần về viện
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "nghi-dinh": { ...shot([VIEN[0], 0, VIEN[1]], 80, 200, 90, 1), mood: MOOD.day },
    "nam-truong": { ...shot([VIEN[0], 0, VIEN[1]], 80, 300, 160, -1), mood: MOOD.sunset + 0.5 },
    "khoa-dau": { ...shot([DON_THUY[0], 0, DON_THUY[1]], 90, 200, 90, 1), mood: MOOD.sunset + 0.55 },
    "ve-sau": { ...shot([VIEN[0], 0, VIEN[1]], 70, 260, 130, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
