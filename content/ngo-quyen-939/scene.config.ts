import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Cổ Loa (CO_LOA) bắc; Đại La (DAI_LA) giữa; Bạch Đằng đông; Ái châu, Hoan châu nam.
// Hoạt cảnh trong từng phân cảnh: quân Ngô Quyền (son) từ cửa Bạch Đằng trở về; đốm vàng sáng ở Đại La; đoàn người (son) rời Đại La (đốm vàng mờ dần) lên Cổ Loa (đốm vàng sáng lên); theo thanh kéo, các hào trưởng (chấm ngà) từ Trà Hương, Ái châu, Hoan châu về Cổ Loa; trăm quan (đốm ngà) quanh đốm vàng; đốm vàng ở Cổ Loa lịm dần (Ngô Quyền mất); một đốm ngà (Dương Tam Kha) sáng lên
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "bach-dang": { ...shot([180, 0, 80], 70, 270, 150, 1), mood: MOOD.dawn + 0.5 },
    "co-loa": { ...shot([100, 0, 80], 80, 270, 150, -1), mood: MOOD.sunset + 0.55 },
    "trieu-dinh": { ...shot([60, 0, 60], 85, 270, 150, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([60, 0, 170], 80, 250, 130, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
