import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Cổ Loa (CO_LOA) bắc; Nam Sách (NAM_SACH) đông; Từ Liêm (TU_LIEM) tây nam; Thái Bình (THAI_BINH) tây; Hoa Lư nam.
// Hoạt cảnh trong từng phân cảnh: Ngô Xương Ngập (chấm ngà) chạy từ Cổ Loa về Nam Sách; ba lần quân (xanh nhạt) đuổi theo rồi quay về; quân (son) do Ngô Xương Văn dẫn rời Cổ Loa đi về phía Thái Bình, dừng ở Từ Liêm (đốm ngà); theo thanh kéo, đoàn quân (son) quay về Cổ Loa; đốm vàng sáng ở Cổ Loa; Xương Ngập (chấm ngà) từ Nam Sách được đón về; quân (son) đánh Hoa Lư rồi quay về; sau cùng đi đánh Thái Bình, nhiều người ngã; đốm vàng ở Cổ Loa lịm dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "cuop-ngoi": { ...shot([200, 0, 120], 70, 270, 150, 1), mood: MOOD.dawn + 0.5 },
    "tu-liem": { ...shot([-60, 0, 80], 80, 270, 150, -1), mood: MOOD.sunset + 0.55 },
    "quay-ve": { ...shot([20, 0, 100], 70, 270, 150, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([-40, 0, 0], 80, 270, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
