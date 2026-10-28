import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CAU_GIAY, HA_NOI, TIEN_DON } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông lớn ở phía đông; Hà Nội (HA_NOI) bên bờ tây sông; Cầu Giấy (CAU_GIAY) ở phía tây thành; đồi Sơn Tây (SON_TAY) ở
// tây xa; các tỉnh đồng bằng (TINH) quanh thành. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (tàu cập bến và quân vào thành, quân tản ra các tỉnh và quân Cờ Đen lấy lại các chốt phía tây, quân từ Sơn Tây tiến về thành,
// phục kích ở Cầu Giấy, quân Pháp rút) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330, 210, -300], look: [30, 0, 80], mood: MOOD.dawn + 0.3 },
    "ha-noi": { ...shot([140, 0, 60], 0, 230, 110, 1), mood: MOOD.dawn + 0.8 },
    "cac-tinh": { ...shot([0, 0, 0], 90, 340, 200, -1, 0.2), mood: MOOD.overcast + 0.3 },
    "co-den": { ...shot([TIEN_DON[0] + 40, 0, 110], 20, 220, 110, 1), mood: MOOD.overcast },
    "cau-giay": { ...shot([CAU_GIAY[0] + 20, 0, CAU_GIAY[1]], 90, 230, 105, -1), mood: MOOD.day - 0.0 },
    "sau-tran": { ...shot([HA_NOI[0], 0, HA_NOI[1]], 60, 240, 115, 1), mood: MOOD.sunset + 0.3 },
  },
};

export default config;
