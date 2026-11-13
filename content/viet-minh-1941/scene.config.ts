import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hang Cốc Bó (COC_BO) bắc; Pác Bó (PAC_BO) giữa; rừng Khuổi Nậm (KHUOI_NAM) đông; bản (BAN) nam.
// Hoạt cảnh trong từng phân cảnh: một đốm ngà (Nguyễn Ái Quốc) cùng vài người (son) qua biên giới vào hang Cốc Bó; đốm vàng ở cửa hang, bàn đá bên suối; theo thanh kéo, các đại biểu (ngà) từ nhiều ngả tụ về lán họp trong rừng Khuổi Nậm (đốm vàng); từ Pác Bó, các đốm ngà (hội cứu quốc) lần lượt sáng ở các bản xa dần; người (son) đi lại giữa các bản; 34 chấm người (son) đứng thành hàng trong khu rừng; đốm vàng sáng giữa đội
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "coc-bo": { ...shot([-20, 0, 100], 90, 170, 80, 1), mood: MOOD.dawn + 0.5 },
    "khuoi-nam": { ...shot([110, 0, 60], 95, 160, 70, -1), mood: MOOD.sunset + 0.65 },
    "lan-rong": { ...shot([20, 0, -20], 85, 260, 140, 1), mood: MOOD.sunset + 0.6 },
    "giai-phong-quan": { ...shot([30, 0, -120], 80, 170, 80, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
