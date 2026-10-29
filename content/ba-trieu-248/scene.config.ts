import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { NUI_NUA, TU_PHO, BO_DIEN, NUI_TUNG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông, núi ở phía tây; núi Nưa (NUI_NUA) ở phía tây, Tư Phố (TU_PHO) ở giữa, Bồ Điền (BO_DIEN) ở đông bắc, Giao Châu (GIAO_CHAU) ở xa phía bắc, núi Tùng (NUI_TUNG) gần Bồ Điền. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: các nhóm người (son) từ nhiều ngả tụ về núi Nưa, một đốm ngà sáng dần, lửa trại bật lên; đoàn ngà đi từ núi Nưa tới Tư Phố rồi sang Bồ Điền, hai đốm vàng sáng lần lượt; đoàn xanh nhạt (quân phía Giao Châu) từ phía bắc tiến về Bồ Điền theo thanh kéo, người giữ căn cứ (son) đứng ở Bồ Điền; một quầng ngà dịu ở chân núi, các nhóm người (son) đến đứng lặng, lửa bật dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,190,-300], look: [30,0,20], mood: MOOD.dawn + 0.3 },
    "nui-nua": { ...shot([NUI_NUA[0], 0, NUI_NUA[1]], 30, 220, 130, -1), mood: MOOD.day },
    "khoi-nghia": { ...shot([TU_PHO[0], 0, TU_PHO[1]], 150, 240, 130, 1), mood: MOOD.overcast + 0.3 },
    "luc-dan": { ...shot([BO_DIEN[0], 0, BO_DIEN[1]], 200, 250, 140, -1), mood: MOOD.overcast + 0.8 },
    "ve-sau": { ...shot([NUI_TUNG[0], 0, NUI_TUNG[1]], 160, 230, 120, 1), mood: MOOD.sunset },
  },
};

export default config;
