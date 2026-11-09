import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hoà Bình (HOA_BINH) bắc; Phú Lâm (PHU_LAM) nam; núi ở giữa.
// Hoạt cảnh trong từng phân cảnh: phía bắc đèn sáng (đốm vàng); phía nam đèn chập chờn rồi tắt (đốm ngà); theo thanh kéo, hàng cột thép (chuỗi đốm ngà) nối dài từ bắc vào nam qua núi rừng; người thi công (son) dọc tuyến; đóng điện: dòng điện (chuỗi đốm vàng) chạy từ bắc vào nam; phía nam sáng đèn; thành phố phía nam (đốm vàng) sáng đều
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,190,-330], look: [0,0,20], mood: MOOD.dawn + 0.3 },
    "thieu-dien": { ...shot([130, 0, -300], 250, 240, 130, 1), mood: MOOD.sunset + 0.75 },
    "dung-cot": { ...shot([-30, 0, 60], 105, 320, 190, -1), mood: MOOD.sunset + 0.7 },
    "dong-dien": { ...shot([-30, 0, 60], 105, 320, 190, 1), mood: MOOD.sunset + 0.75 },
    "ve-sau": { ...shot([130, 0, -300], 260, 220, 110, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
