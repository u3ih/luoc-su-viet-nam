import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { PHU_XUAN, NUI_BAN, DAN_DUONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Hương; Phú Xuân (PHU_XUAN) bờ bắc; núi Bân (NUI_BAN) bờ nam; cung Đan Dương (DAN_DUONG).
// Hoạt cảnh trong từng phân cảnh: đàn Nam Giao trên núi Bân: đốm vàng sáng rực; người (son) đứng quanh; rồi đoàn quân (son) lên đường ra Bắc; các đốm vàng (trường học, chữ Nôm, khuyến nông) lan từ Phú Xuân ra khắp vùng theo thanh kéo; đêm; đốm vàng ở Phú Xuân chập chờn rồi lịm; người (son) đưa tang về cung Đan Dương; một chấm ngà (sứ báo tang) đi về phương bắc
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "len-ngoi": { ...shot([NUI_BAN[0], 0, NUI_BAN[1]], 270, 240, 120, 1), mood: MOOD.dawn + 0.3 },
    "cai-cach": { ...shot([-20, 0, 30], 80, 320, 170, -1), mood: MOOD.day },
    "bang-ha": { ...shot([PHU_XUAN[0], 0, PHU_XUAN[1]], 70, 200, 90, 1), mood: MOOD.sunset + 0.85 },
    "ve-sau": { ...shot([DAN_DUONG[0], 0, DAN_DUONG[1]], 80, 200, 90, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
