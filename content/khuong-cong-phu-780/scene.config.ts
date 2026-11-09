import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Ái Châu (AI_CHAU) phía nam; Tràng An (TRANG_AN) phía bắc; Tuyền Châu (TUYEN_CHAU) phía đông.
// Hoạt cảnh trong từng phân cảnh: làng Ái Châu (đốm ngà); dân làng (son); hai chấm ngà (hai anh em) đi quanh làng; theo thanh kéo, hai chấm ngà đi từ Ái Châu lên Tràng An; sĩ tử (xanh nhạt) tụ ở kinh thành; đốm vàng (đỗ đầu) sáng lên; quân (xanh nhạt) kéo tới kinh thành; trong thành, đốm ngà (Khương Công Phụ) bên đốm vàng (vua); quân trong thành gom lại; chấm ngà rời kinh thành đi Tuyền Châu ở phía đông; đền thờ ông (đốm vàng) ở Tuyền Châu và ở Ái Châu
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "que-huong": { ...shot([-40, 0, -170], 80, 160, 70, 1), mood: MOOD.dawn + 0.5 },
    "do-dau": { ...shot([20, 0, 20], 85, 330, 190, -1), mood: MOOD.sunset + 0.55 },
    "can-gian": { ...shot([60, 0, 230], 80, 230, 110, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([120, 0, 40], 60, 320, 170, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
