import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Tống Bình (TONG_BINH) giữa; các châu quanh; thương cảng (CANG) đông.
// Hoạt cảnh trong từng phân cảnh: đốm xanh nhạt ở Tống Bình; mười hai đốm (các châu) lần lượt sáng quanh đồng bằng; thuyền buôn (chấm sáng ngà) từ biển vào thương cảng; một nhóm người nổi dậy (son) tiến về thành rồi ngã; theo thanh kéo, ba lần người nổi dậy (son) từ ba phía kéo về thành Tống Bình, mỗi lần một đốm lửa bùng lên; quân từ xa (xanh nhạt) đến từ tây bắc rồi rút; thành Tống Bình (đốm vàng) sáng — thành Tĩnh Hải quân
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "muoi-hai-chau": { ...shot([40, 0, 40], 75, 270, 150, 1), mood: MOOD.dawn + 0.5 },
    "ly-tu-tien": { ...shot([180, 0, 0], 60, 260, 140, -1), mood: MOOD.sunset + 0.55 },
    "noi-day": { ...shot([40, 0, 40], 80, 250, 140, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([40, 0, 60], 70, 250, 140, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
