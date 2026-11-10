import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh thành (CUNG); trường thi (TRUONG_THI) nam; Côn Sơn (CON_SON) đông; Lệ Chi viên (LE_CHI) đông nam.
// Hoạt cảnh trong từng phân cảnh: đốm vàng nhỏ (vua mười một tuổi) sáng giữa cung; ba đốm ngà lớn (các đại thần phò chính) quanh đó; đốm ngà lớn (Lê Sát) át các đốm khác; về sau đốm ấy tắt, đốm vàng sáng hơn; theo thanh kéo, sĩ tử (son) các đạo về trường thi; ba đốm vàng (tiến sĩ cập đệ) sáng lên; vua (chấm ngà) tuần du về miền đông, ghé Côn Sơn rồi đến vườn Vải; đốm vàng ở kinh thành tắt
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "len-ngoi": { ...shot([-20, 0, 80], 80, 220, 120, 1), mood: MOOD.dawn + 0.5 },
    "le-sat": { ...shot([-20, 0, 80], 85, 210, 110, -1), mood: MOOD.sunset + 0.6 },
    "thi-cu": { ...shot([-20, 0, -20], 80, 250, 140, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([140, 0, 40], 75, 260, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
