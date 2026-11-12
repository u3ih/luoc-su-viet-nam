import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hoa Lư (HOA_LU) tây; Phù Lan (PHU_LAN) đông bắc; Ái Châu (AI_CHAU) nam; nhà Tống (TONG) góc đông bắc.
// Hoạt cảnh trong từng phân cảnh: bốn toán quân của các hoàng tử (son, ngà, xanh nhạt) kéo về Hoa Lư giằng co; cuối cùng một đốm vàng (ngôi vua) sáng ở kinh đô; quân triều đình (son) từ Hoa Lư đánh trại Phù Lan (lửa vòng quanh trại), rồi xuống Ái Châu; theo thanh kéo, đoàn sứ (chấm ngà) đi từ Hoa Lư sang nhà Tống rồi mang kinh sách (đốm vàng) về; dân Ái Châu (son) đào kênh; đốm vàng ở Hoa Lư lụi dần (vua mất); một đốm ngà (Lý Công Uẩn) sáng lên giữa vòng triều thần (son)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "tranh-ngoi": { ...shot([-60, 0, 60], 80, 220, 120, 1), mood: MOOD.dawn + 0.5 },
    "dep-loan": { ...shot([40, 0, 0], 85, 270, 150, -1), mood: MOOD.sunset + 0.55 },
    "kinh-sach": { ...shot([110, 0, 170], 60, 270, 150, 1), mood: MOOD.sunset + 0.65 },
    "danh-gia": { ...shot([-60, 0, 60], 75, 200, 110, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
