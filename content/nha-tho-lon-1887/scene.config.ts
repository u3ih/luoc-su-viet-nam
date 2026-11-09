import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { NHA_THO } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Nhà thờ (NHA_THO) phía tây hồ Hoàn Kiếm (HO); sông Hồng phía đông.
// Hoạt cảnh trong từng phân cảnh: đốm ngà (nền chùa cũ) lịm dần; người (son) họp chợ trên khu đất; theo thanh kéo, nhà thờ gạch (đốm vàng dọc thân) và hai tháp chuông (hai cột đốm vàng) cao dần; thợ (son) quanh công trường; cửa kính màu (đốm ngà, vàng) dọc thân nhà thờ; hai tháp chuông; lễ rước (son) đi quanh nhà thờ; hai tháp chuông
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "khu-dat": { ...shot([NHA_THO[0], 0, NHA_THO[1]], 80, 200, 80, 1), mood: MOOD.dawn + 0.5 },
    "xay-dung": { ...shot([NHA_THO[0], 0, NHA_THO[1]], 80, 170, 70, -1), mood: MOOD.sunset + 0.6 },
    "kien-truc": { ...shot([NHA_THO[0], 0, NHA_THO[1]], 60, 150, 60, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([NHA_THO[0], 0, NHA_THO[1]], 85, 200, 85, -1), mood: MOOD.sunset + 0.55 },
  },
};

export default config;
