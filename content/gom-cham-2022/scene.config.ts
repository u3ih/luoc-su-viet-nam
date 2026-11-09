import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { BAU_TRUC, BAI_NUNG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Làng Bàu Trúc (BAU_TRUC) cạnh ao; sông Quao phía bắc; bãi nung (BAI_NUNG).
// Hoạt cảnh trong từng phân cảnh: người (son) từ sông Quao gánh đất sét về làng gốm (đốm ngà); theo thanh kéo, những người thợ (chấm ngà) đi vòng quanh bàn gốm; dáng gốm (đốm vàng) cao dần; gốm xếp thành đống, phủ rơm củi rồi nung lộ thiên (lửa) trên bãi; làng gốm (đốm vàng) trong chiều; người (son) qua lại
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "bau-truc": { ...shot([0, 0, 60], 80, 260, 110, 1), mood: MOOD.dawn + 0.5 },
    "nan-gom": { ...shot([BAU_TRUC[0], 0, BAU_TRUC[1]], 80, 110, 40, -1), mood: MOOD.sunset + 0.6 },
    "nung-gom": { ...shot([BAI_NUNG[0], 0, BAI_NUNG[1]], 80, 140, 55, 1), mood: MOOD.sunset + 0.75 },
    "ve-sau": { ...shot([30, 0, -20], 85, 220, 95, -1), mood: MOOD.sunset + 0.55 },
  },
};

export default config;
