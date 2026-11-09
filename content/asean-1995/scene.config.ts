import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Vòng các đảo gợi các nước thành viên; đảo giữa (BRUNEI).
// Hoạt cảnh trong từng phân cảnh: năm nước sáng lập (đốm ngà) sáng lên trên vòng; sau đó nước thứ sáu; theo thanh kéo, tàu (chấm vàng) tới đảo giữa; đốm vàng thứ bảy nối vào vòng các nước; thêm ba nước (đốm xanh nhạt) sáng lên — ASEAN mười nước; nước thứ mười một sáng lên; tàu thuyền (chấm ngà) qua lại giữa các đảo
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-300,170,-300], look: [0,0,0], mood: MOOD.dawn + 0.3 },
    "bangkok": { ...shot([0, 0, 0], 80, 330, 220, 1), mood: MOOD.dawn + 0.5 },
    "gia-nhap": { ...shot([0, 0, 0], 70, 300, 200, -1), mood: MOOD.sunset + 0.6 },
    "asean-10": { ...shot([0, 0, 0], 90, 330, 230, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([0, 0, 0], 80, 340, 240, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
