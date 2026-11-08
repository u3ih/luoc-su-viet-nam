import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hoàng thành (KINH) giữa, Chân Giáo (CHAN_GIAO) trong thành, Long Hưng (LONG_HUNG) đông nam.
// Hoạt cảnh trong từng phân cảnh: một đốm ngà (thái tử) rời kinh về Long Hưng, rồi đoàn quân họ Trần (son) từ Long Hưng kéo về kinh; đốm vàng (ngai) giữa hoàng thành; đốm ngà (Huệ Tông) đi về chùa Chân Giáo; người họ Trần (son) vào hầu quanh điện; triều thần (son) từ bốn cửa tụ về điện theo thanh kéo, đốm vàng sáng dần ở giữa; đốm vàng giữa hoàng thành; các toán quân (son) tỏa đi các nơi dẹp loạn
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-300,150,-280], look: [40,0,0], mood: MOOD.dawn + 0.3 },
    "ho-tran": { ...shot([60, 0, -60], 90, 300, 140, 1), mood: MOOD.overcast + 0.3 },
    "chieu-hoang": { ...shot([KINH[0], 0, KINH[1]], 70, 190, 80, -1), mood: MOOD.day },
    "nhuong-ngoi": { ...shot([KINH[0], 0, KINH[1]], 90, 210, 90, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([0, 0, 0], 75, 340, 170, -1), mood: MOOD.sunset + 0.3 },
  },
};

export default config;
