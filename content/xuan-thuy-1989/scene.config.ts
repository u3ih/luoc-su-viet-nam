import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Cửa sông Hồng chảy từ bắc xuống nam; bãi bồi (BAI_BOI) đông nam; làng (LANG) tây bắc; biển phía nam.
// Hoạt cảnh trong từng phân cảnh: dải đốm ngà (bãi bồi mới) nối dài dần dọc bờ biển phía đông cửa sông; đốm vàng lớn (vùng Ramsar) sáng giữa bãi bồi, các vòng đốm tỏa ra; theo thanh kéo, đàn chim di cư (chấm xanh nhạt) từ phương bắc bay về, hạ xuống bãi bồi; người làng (son) ra đầm tôm, bãi ngao; ánh đèn làng (đốm vàng) sáng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "bai-boi": { ...shot([40, 0, -40], 80, 230, 110, 1), mood: MOOD.dawn + 0.5 },
    "ramsar": { ...shot([70, 0, -30], 80, 200, 110, -1), mood: MOOD.sunset + 0.65 },
    "chim-di-cu": { ...shot([60, 0, 40], 80, 250, 120, 1), mood: MOOD.sunset + 0.6 },
    "lang-ven-bien": { ...shot([-160, 0, 80], 70, 220, 110, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
