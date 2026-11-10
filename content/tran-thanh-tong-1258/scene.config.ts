import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thăng Long (THANG_LONG) bắc; Thiên Trường đông nam; Bạch Hạc tây bắc; Hoan – Ái tây nam.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (vua mới) sáng giữa hoàng thành; tôn thất (chấm ngà) tụ về quây quần; vua (chấm ngà) về Thiên Trường; ba đốm vàng (cung Trùng Quang, Trùng Hoa, chùa Phổ Minh) sáng lên; theo thanh kéo, sĩ tử (son) từ phía bắc và từ châu Hoan, Ái kéo về kinh; hai đốm vàng (kinh trạng nguyên, trại trạng nguyên) sáng lên; đinh tráng (son) tụ về các bãi sông Bạch Hạc tập trận; chín đốm ngà dọc bãi; thuyền chiến (chấm sáng) trên sông
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "nhuong-ngoi": { ...shot([80, 0, 140], 80, 230, 130, 1), mood: MOOD.dawn + 0.5 },
    "thien-truong": { ...shot([160, 0, -120], 75, 240, 140, -1), mood: MOOD.sunset + 0.55 },
    "khoa-thi": { ...shot([20, 0, 40], 75, 270, 150, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([-160, 0, 220], 80, 220, 130, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
