import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HANG_DAO } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông lớn ở phía đông; Hà Nội (HA_NOI) bên bờ sông; phố Hàng Đào (HANG_DAO) trong khu thành thị; các tỉnh lân cận (TINH) rải xung quanh. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (người tụ về Hàng Đào, bốn đốm vàng quanh trường, các lớp lan ra các tỉnh theo thanh kéo, đốm sáng mờ dần và người tản đi, quảng trường lặng)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-300, 170, -280], look: [0, 0, 20], mood: MOOD.dawn + 0.3 },
    "hang-dao": { ...shot([HANG_DAO[0], 0, HANG_DAO[1]], 90, 200, 100, 1), mood: MOOD.day },
    "mo-hinh": { ...shot([HANG_DAO[0], 0, HANG_DAO[1]], 20, 210, 110, -1), mood: MOOD.day - 0.4 },
    "day-hoc": { ...shot([10, 0, -80], 45, 360, 230, 1), mood: MOOD.sunset - 0.3 },
    "dong-cua": { ...shot([HANG_DAO[0], 0, HANG_DAO[1]], 120, 210, 100, -1), mood: MOOD.overcast + 0.5 },
    "ngay-nay": { ...shot([HANG_DAO[0], 0, HANG_DAO[1]], 160, 210, 100, 1), mood: MOOD.sunset - 0.2 },
  },
};

export default config;
