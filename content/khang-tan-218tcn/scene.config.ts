import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông chảy bắc → nam; kênh (KENH) bắc; trại Tần (TRAI); làng Việt (LANG) nam; rừng sâu (RUNG) tây nam.
// Hoạt cảnh trong từng phân cảnh: quân Tần (xanh nhạt) theo sông kéo xuống phía nam, dựng trại; chuỗi đốm xanh nhạt (kênh Linh Cừ) đào dần; người Việt (son) từ rừng đánh úp quân đào kênh; theo thanh kéo, người Việt (son) rời làng rút vào rừng sâu; quân Tần (xanh nhạt) tiến sâu xuống phía nam; người Việt (son) từ rừng đánh úp quân Tần (xanh nhạt ngã xuống); đốm vàng sáng lên ở làng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "nam-tien": { ...shot([-20, 0, 220], 80, 300, 170, 1), mood: MOOD.dawn + 0.5 },
    "linh-cu": { ...shot([-60, 0, 290], 70, 230, 120, -1), mood: MOOD.sunset + 0.55 },
    "rung-sau": { ...shot([-40, 0, -60], 80, 290, 160, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([-60, 0, -60], 70, 260, 140, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
