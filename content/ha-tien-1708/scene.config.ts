import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { NAM_VANG, CANG_KHAU } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông, núi ở phía tây; Cảng Khẩu (CANG_KHAU) giữa bờ biển; Kampot (KAMPOT) ở đầu bắc, Cà Mau (CA_MAU) ở đầu nam; Nam Vang (NAM_VANG) trong đất liền. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: các nhóm người (son) tụ về Nam Vang quanh một đốm ngà (Mạc Cửu), lửa bật dần; đoàn ngà cùng các nhóm người (son) đi từ Nam Vang ra bờ biển tới Cảng Khẩu; đốm ngà sáng ở Cảng Khẩu; bảy đốm vàng (bảy xã thôn) hiện dần dọc bờ biển theo thanh kéo, từ Kampot xuống Cà Mau; quầng vàng dịu ở Cảng Khẩu, các nhóm người (son) đến đứng lặng, lửa bật dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,190,-300], look: [60,0,0], mood: MOOD.dawn + 0.3 },
    "mac-cuu": { ...shot([NAM_VANG[0], 0, NAM_VANG[1]], 30, 220, 120, 1), mood: MOOD.day },
    "lap-ha-tien": { ...shot([CANG_KHAU[0], 0, CANG_KHAU[1]], 20, 230, 110, -1), mood: MOOD.dawn + 0.8 },
    "quy-phuc": { ...shot([CANG_KHAU[0], 0, CANG_KHAU[1]], 30, 380, 220, 1), mood: MOOD.sunset - 0.3 },
    "ve-sau": { ...shot([CANG_KHAU[0], 0, CANG_KHAU[1]], 60, 240, 120, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
