import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Đồng Nai chéo cảnh; đập (DAP) giữa; TP. Hồ Chí Minh (TP_HCM) tây nam.
// Hoạt cảnh trong từng phân cảnh: chuyên gia (ngà) và công nhân (son) tụ về hai bờ sông Đồng Nai; theo thanh kéo, đập đất đá (khối tường) đắp dần chắn ngang sông; công nhân (son) trên đập; bốn tổ máy (đốm vàng) lần lượt sáng; điện (chuỗi đốm vàng) toả về phía tây nam; nước tưới (đốm ngà) toả xuống đồng ruộng hạ lưu; thuyền (chấm ngà) trên sông
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,160,-150], look: [0,0,0], mood: MOOD.dawn + 0.3 },
    "song-dong-nai": { ...shot([0, 0, 0], 120, 230, 110, 1), mood: MOOD.dawn + 0.5 },
    "dap": { ...shot([0, 0, 0], 60, 200, 100, -1), mood: MOOD.sunset + 0.6 },
    "phat-dien": { ...shot([-60, 0, -40], 70, 280, 150, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([-80, 0, -60], 120, 250, 120, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
