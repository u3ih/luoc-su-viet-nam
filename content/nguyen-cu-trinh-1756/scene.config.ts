import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Gia Định (GIA_DINH) đông bắc; Tầm Bôn (TAM_BON) giữa; Lôi Lạp (LOI_LAP) đông nam; Hà Tiên (HA_TIEN_N) tây.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (Nguyễn Cư Trinh) ở Gia Định; các đốm ngà nhỏ (bài vè, bài thơ Nôm) quanh; quân (son) từ Gia Định chia hai đường đánh sang phía tây; các nhóm người Côn Man (ngà) đi theo; theo thanh kéo, những đoàn người định cư (ngà) đi từ Gia Định xuống vùng Tầm Bôn, Lôi Lạp; đốm vàng ở hai phủ mới; các làng Khmer (đốm ngà) vẫn sáng khắp đồng bằng; thêm hai vùng đất xa (Trà Vang, Ba Thắc) sáng ở phía nam
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "cu-trinh": { ...shot([110, 0, 140], 60, 160, 80, 1), mood: MOOD.dawn + 0.5 },
    "con-man": { ...shot([0, 0, 40], 120, 240, 130, -1), mood: MOOD.overcast + 0.6 },
    "tam-bon": { ...shot([60, 0, 20], 90, 220, 120, 1), mood: MOOD.day },
    "ba-thac": { ...shot([-20, 0, -20], 60, 250, 140, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
