import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Tân Vũ (TAN_VU) tây; cảng Lạch Huyện (LACH_HUYEN) đông; biển giữa.
// Hoạt cảnh trong từng phân cảnh: phà, xà lan (chấm ngà) chậm chạp qua lại giữa đất liền và đảo; tàu (chấm xanh nhạt) chen nhau trên kênh; theo thanh kéo, các nhịp cầu (chuỗi đốm vàng) lần lượt nối từ đất liền ra đảo; xà lan (chấm ngà) bên cạnh; cầu sáng trọn (đốm vàng); xe (chấm ngà) chạy qua từ Tân Vũ tới cảng Lạch Huyện; dòng xe hai chiều (chấm ngà, vàng) trên cầu; tàu biển (đốm xanh nhạt) cập cảng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "pha-xa-lan": { ...shot([0, 0, 0], 80, 230, 110, 1), mood: MOOD.dawn + 0.5 },
    "thi-cong": { ...shot([0, 0, 0], 30, 260, 110, -1), mood: MOOD.sunset + 0.6 },
    "khanh-thanh": { ...shot([0, 0, 0], 80, 200, 70, 1), mood: MOOD.sunset + 0.65 },
    "ngay-nay": { ...shot([60, 0, 0], 10, 260, 90, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
