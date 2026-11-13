import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Phú Xuân (PHU_XUAN), Hội An (HOI_AN_S) bắc; Oudong (OUDONG) tây nam; Prey Nokor (PREY_NOKOR) nam.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (phủ chúa ở Phú Xuân); thuyền (son) đóng ở cửa biển; quân (son) dàn phía bắc; thuyền buôn (đốm ngà, đốm xanh nhạt) từ biển xa vào Hội An; phố buôn (đốm vàng nhỏ) sáng; theo thanh kéo, đoàn thuyền đưa dâu (đốm vàng) đi từ Phú Xuân theo đường biển vào sông tới Oudong; đốm vàng nhỏ (trạm thu thuế) sáng ở Prey Nokor; thuyền (ngà) qua lại; các làng Khmer (đốm ngà) quanh vẫn sáng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "noi-ngoi": { ...shot([60, 0, 190], 60, 170, 90, 1), mood: MOOD.dawn + 0.5 },
    "hoi-an": { ...shot([90, 0, 130], 20, 170, 80, -1), mood: MOOD.day },
    "ngoc-van": { ...shot([-20, 0, 30], 120, 260, 150, 1), mood: MOOD.sunset + 0.6 },
    "prey-nokor": { ...shot([20, 0, -140], 90, 180, 100, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
