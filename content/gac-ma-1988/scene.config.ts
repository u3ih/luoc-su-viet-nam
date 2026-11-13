import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Gạc Ma (GAC_MA) giữa; Cô Lin (CO_LIN) đông; Len Đao (LEN_DAO) bắc.
// Hoạt cảnh trong từng phân cảnh: ba tàu vận tải (ngà) từ phía tây nam tới ba bãi đá; các tàu (xanh nhạt) từ phía đông bắc tới gần; theo thanh kéo, các chiến sĩ (son) từ tàu xuống bãi đá Gạc Ma, đứng thành vòng quanh đốm vàng (lá cờ); lửa trên các tàu vận tải; đốm vàng ở Gạc Ma tắt, đốm xanh nhạt sáng; đốm ngà vẫn sáng ở các bãi đá khác; sáu mươi tư đốm vàng nhỏ (hoa đăng) toả thành vòng trên mặt biển quanh Gạc Ma
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "cq-88": { ...shot([20, 0, 30], 70, 250, 130, 1), mood: MOOD.dawn + 0.5 },
    "sang-14-3": { ...shot([0, 0, 0], 90, 130, 50, -1), mood: MOOD.dawn + 0.7 },
    "ba-bai-da": { ...shot([30, 0, 30], 90, 220, 120, 1), mood: MOOD.overcast + 0.6 },
    "tuong-niem": { ...shot([0, 0, 0], 100, 170, 70, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
