import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CHU_XA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Chử Xá (CHU_XA) bên sông Hồng; chợ (CHO); đầm Nhất Dạ (DAM) bắc; núi Quỳnh Viên (QUYNH_VIEN) xa tây nam.
// Hoạt cảnh trong từng phân cảnh: một chấm ngà (Chử Đồng Tử) từ làng ra bờ sông; vài thuyền (chấm ngà) xuôi sông; theo thanh kéo, thuyền công chúa (đốm vàng) ghé bãi cát, người hầu (son) lên bờ; cuối cùng đốm ngà (người dưới cát) hiện ra; dân (son) từ bốn phía đổ về chợ Hà Thám (đốm vàng); một đốm ngà theo thuyền buôn đi xa tới núi Quỳnh Viên; cột đốm vàng (thành quách) nổi lên rồi bay lên trời và lịm; quân vua (xanh nhạt) dừng bên kia sông; đốm ngà (miếu thờ) bên đầm
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "chiec-kho": { ...shot([CHU_XA[0], 0, CHU_XA[1]], 80, 170, 60, 1), mood: MOOD.dawn + 0.5 },
    "bai-cat": { ...shot([250, 0, -30], 75, 170, 60, -1), mood: MOOD.sunset + 0.55 },
    "cho-ha-tham": { ...shot([-30, 0, -100], 80, 260, 120, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([-150, 0, 130], 80, 280, 130, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
