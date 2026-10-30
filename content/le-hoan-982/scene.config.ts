import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { INDRAPURA, VIJAYA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông, núi ở phía tây; Đại Cồ Việt (DAI_CO_VIET) ở đầu bắc; Indrapura (INDRAPURA) bên sông ở giữa; Vijaya (VIJAYA) ở đầu nam. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: hai đốm sáng — ngà ở phía bắc (Đại Cồ Việt), xanh nhạt ở Indrapura — sáng dần; vài nhóm người (son) đi lại quanh mỗi nơi; một đốm ngà đi từ phía bắc xuống Indrapura rồi dừng lại ở đó; đoàn ngà từ phía bắc tiến vào Indrapura theo thanh kéo; đốm xanh nhạt ở Indrapura mờ đi khi đoàn tới; một đốm sáng xanh nhạt nhỏ dần ở Indrapura rồi sáng ở Vijaya phía nam; vài nhóm người (son) đi lại
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [330,190,-300], look: [-30,0,0], mood: MOOD.dawn + 0.3 },
    "boi-canh": { ...shot([INDRAPURA[0], 0, INDRAPURA[1]], 160, 240, 130, 1), mood: MOOD.overcast + 0.5 },
    "su-gia": { ...shot([INDRAPURA[0], 0, INDRAPURA[1]], 20, 230, 110, -1), mood: MOOD.day },
    "nam-982": { ...shot([INDRAPURA[0], 0, INDRAPURA[1]], 150, 260, 140, 1), mood: MOOD.sunset - 0.2 },
    "ve-sau": { ...shot([VIJAYA[0], 0, VIJAYA[1]], 160, 230, 120, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
