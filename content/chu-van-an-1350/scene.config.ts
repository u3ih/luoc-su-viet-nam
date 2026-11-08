import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HUYNH_CUNG, KINH, PHUONG_HOANG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Huỳnh Cung (HUYNH_CUNG) tây nam, kinh đô (KINH) giữa, núi Phượng Hoàng (PHUONG_HOANG) đông bắc.
// Hoạt cảnh trong từng phân cảnh: học trò (son) từ nhiều ngả tụ về trường làng Huỳnh Cung, đốm ngà (thầy) sáng ở trường; đốm ngà đi từ Huỳnh Cung lên kinh đô; đốm vàng sáng ở Quốc Tử Giám, học trò (son) tụ lại; đốm vàng ở kinh đô lịm dần; đốm ngà rời kinh đô đi về núi Phượng Hoàng theo thanh kéo, vài học trò (son) theo sau; đốm vàng sáng trên núi Phượng Hoàng; học trò (son) theo đường lên núi; một đốm vàng nữa ở kinh đô (thờ ở Văn Miếu)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-300,150,-300], look: [40,0,60], mood: MOOD.dawn + 0.3 },
    "huynh-cung": { ...shot([HUYNH_CUNG[0], 0, HUYNH_CUNG[1]], 70, 220, 100, 1), mood: MOOD.day },
    "quoc-tu-giam": { ...shot([KINH[0], 0, KINH[1]], 70, 230, 100, -1), mood: MOOD.day },
    "that-tram": { ...shot([90, 0, 150], 50, 340, 170, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([PHUONG_HOANG[0], 0, PHUONG_HOANG[1]], 40, 280, 150, -1), mood: MOOD.sunset + 0.3 },
  },
};

export default config;
