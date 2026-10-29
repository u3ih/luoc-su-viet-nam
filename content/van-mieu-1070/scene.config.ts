import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { VAN_MIEU, THANG_LONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông lớn ở phía đông; Thăng Long (THANG_LONG) bên bờ sông; khu Văn Miếu (VAN_MIEU) ở phía tây; các làng (LANG_A, LANG_B, LANG_C) rải xung quanh. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: các nhóm người (son) từ Thăng Long đi tới khu Văn Miếu, một đốm ngà sáng dần ở đó, đèn bật dần; các nhóm người (son) từ ba làng tụ về Thăng Long theo thanh kéo; một đốm vàng sáng ở khu Văn Miếu; bốn đốm vàng sáng lần lượt quanh khu Văn Miếu (các khoa thi nối nhau), vài nhóm người đi lại; hai hàng đốm vàng (vườn bia) sáng đều hai bên một điểm giữa; khách (son) đến đứng lặng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-300,170,-280], look: [0,0,20], mood: MOOD.dawn + 0.3 },
    "van-mieu": { ...shot([VAN_MIEU[0], 0, VAN_MIEU[1]], 20, 210, 100, 1), mood: MOOD.day },
    "khoa-thi": { ...shot([THANG_LONG[0], 0, THANG_LONG[1]], 150, 260, 140, -1), mood: MOOD.dawn + 0.9 },
    "ve-sau": { ...shot([VAN_MIEU[0], 0, VAN_MIEU[1]], 110, 220, 110, 1), mood: MOOD.overcast + 0.4 },
    "ngay-nay": { ...shot([VAN_MIEU[0], 0, VAN_MIEU[1]], 160, 220, 100, -1), mood: MOOD.sunset - 0.2 },
  },
};

export default config;
