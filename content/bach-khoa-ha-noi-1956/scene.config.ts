import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Trường (TRUONG) giữa; Lạng Sơn (LANG_SON) đông bắc; khoảng trống (MAT) tây.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (nghị định thành lập) sáng; bốn đốm ngà (bốn liên khoa) xếp quanh; theo thanh kéo, 848 sinh viên (son) vào trường; năm năm sau 633 kỹ sư (đốm vàng) ra trường; đoàn người (son) cùng thiết bị (chấm ngà) rời Hà Nội lên vùng núi Lạng Sơn; lớp học (đốm vàng) sáng giữa núi; trường (đốm vàng) toả cán bộ đi lập các trường khác (đốm ngà ở xa); cột đốm (thư viện mười tầng)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "thanh-lap": { ...shot([-40, 0, 30], 80, 200, 110, 1), mood: MOOD.dawn + 0.5 },
    "khoa-1": { ...shot([-60, 0, 40], 80, 200, 110, -1), mood: MOOD.sunset + 0.65 },
    "so-tan": { ...shot([120, 0, 140], 55, 250, 140, 1), mood: MOOD.sunset + 0.6 },
    "ngay-nay": { ...shot([0, 0, 20], 80, 220, 120, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
