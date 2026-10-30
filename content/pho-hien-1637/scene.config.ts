import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { PHO_HIEN, THANG_LONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông, sông lớn chảy tây bắc – đông nam; Phố Hiến (PHO_HIEN) giữa bờ sông, Thăng Long (THANG_LONG) phía bắc, Châu Cầu (CHAU_CAU) tây nam, Ninh Hải (NINH_HAI) đông nam. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: các nhóm người (son) từ ven sông tụ về Phố Hiến, một đốm ngà sáng dần; các đoàn khách buôn từ ba ngả tụ về bến theo thanh kéo, đốm vàng sáng ở Phố Hiến; hai đốm sáng: Thăng Long (vàng) sáng trước, Phố Hiến (ngà) sáng sau; vài nhóm người (son) đi giữa hai nơi; các nhóm người (son) rời Phố Hiến về Châu Cầu và Ninh Hải, ánh sáng ở Phố Hiến dịu dần, hai đốm vàng sáng ở nơi mới
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,190,-300], look: [30,0,20], mood: MOOD.dawn + 0.3 },
    "pho-hien": { ...shot([PHO_HIEN[0], 0, PHO_HIEN[1]], 20, 230, 120, 1), mood: MOOD.day },
    "thuong-dien": { ...shot([PHO_HIEN[0], 0, PHO_HIEN[1]], 150, 230, 130, -1), mood: MOOD.dawn + 0.8 },
    "kinh-ky": { ...shot([THANG_LONG[0], 0, THANG_LONG[1]], 100, 260, 140, 1), mood: MOOD.day + 0.2 },
    "ve-sau": { ...shot([PHO_HIEN[0], 0, PHO_HIEN[1]], 60, 250, 120, -1), mood: MOOD.sunset },
  },
};

export default config;
