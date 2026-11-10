import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sơn Tây (SON_TAY) tây bắc; vạch bắn (VACH) tây; bia (BIA) đông.
// Hoạt cảnh trong từng phân cảnh: đốm vàng nhỏ (cậu bé) ở Sơn Tây; chấm ngà (người lính) đi về đơn vị, rồi về đội tuyển; những huy chương (cột đốm vàng) cao dần qua các kỳ đại hội; theo thanh kéo, viên đạn cuối (chấm vàng) bay từ vạch bắn tới tâm bia (các vòng đốm ngà); tâm bia bừng sáng; hai đốm: vàng (huy chương vàng) và ngà (huy chương bạc) sáng; khán giả (son)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "xuat-than": { ...shot([-200, 0, 160], 60, 220, 120, 1), mood: MOOD.dawn + 0.5 },
    "thanh-tich": { ...shot([-60, 0, 60], 80, 250, 140, -1), mood: MOOD.sunset + 0.55 },
    "chung-ket": { ...shot([0, 0, 0], 90, 160, 80, 1), mood: MOOD.sunset + 0.75 },
    "ve-sau": { ...shot([0, 0, 0], 85, 200, 110, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
