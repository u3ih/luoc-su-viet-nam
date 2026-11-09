import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hùng Lĩnh (HUNG_LINH) bên sông Mã; Ba Đình (BA_DINH) đông nam; Vạn Lại (VAN_LAI) nam; Niên Kỷ (NIEN_KY) tây bắc.
// Hoạt cảnh trong từng phân cảnh: lửa ở Ba Đình phía đông nam (căn cứ thất thủ); nghĩa quân (son) lui lên thượng nguồn sông Mã; theo thanh kéo, nghĩa quân hai bờ sông Mã (son) tụ về căn cứ Hùng Lĩnh; đốm vàng (căn cứ) sáng lên; quân Pháp (xanh nhạt) tiến từ phía đông; nghĩa quân (son) chuyển về Vạn Lại; lửa ở đồn phía nam; nhóm nghĩa quân còn lại (son) lui vào núi phía tây bắc rồi giải tán; đốm ngà (Tống Duy Tân) ở hang Niên Kỷ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "sau-ba-dinh": { ...shot([150, 0, -100], 40, 300, 170, 1), mood: MOOD.dawn + 0.5 },
    "tro-ve": { ...shot([-20, 0, -20], 80, 230, 110, -1), mood: MOOD.sunset + 0.55 },
    "van-lai": { ...shot([80, 0, -60], 75, 280, 160, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([-150, 0, 130], 80, 300, 160, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
