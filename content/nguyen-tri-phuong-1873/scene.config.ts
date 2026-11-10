import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thành Hà Nội (THANH) giữa; sông Hồng phía đông; cửa nam (CUA_NAM); gò Đống Đa (DONG_DA).
// Hoạt cảnh trong từng phân cảnh: chấm ngà (Nguyễn Tri Phương) từ phương nam ra trấn giữ thành Hà Nội (đốm vàng); tàu, pháo thuyền (xanh nhạt) ngược sông Hồng tới Hà Nội; một nhóm lính (xanh nhạt) lên bờ; theo thanh kéo, pháo thuyền (đốm xanh nhạt) nháy sáng; lính Pháp (xanh nhạt) từ bờ sông tiến vào cửa nam; quân giữ thành (son) rút ra cửa tây; đốm ngà trong thành lịm dần; đền Trung Liệt trên gò Đống Đa (đốm vàng) sáng lên
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "xuat-than": { ...shot([0, 0, 60], 80, 270, 150, 1), mood: MOOD.dawn + 0.5 },
    "garnier": { ...shot([200, 0, 30], 120, 220, 100, -1), mood: MOOD.sunset + 0.55 },
    "thanh-ha-noi": { ...shot([60, 0, 30], 75, 260, 140, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([-120, 0, -60], 60, 260, 130, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
