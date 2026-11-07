import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { VO_MIEU } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Hồng phía đông; thành (THANH) phía tây, Võ Miếu (VO_MIEU) góc tây nam trong thành, Đồn Thủy (DON_THUY) đông nam bên sông, Ô Quan Chưởng (O_QUAN_CHUONG).
// Hoạt cảnh trong từng phân cảnh: đốm ngà sáng giữa thành; người (son) đi tuần dọc tường; đốm vàng ở Ô Quan Chưởng (tấm bia); các chấm xanh nhạt (tàu) ngược sông Hồng lên Đồn Thủy, quân (xanh nhạt) đóng ở đồn; người (son) tụ vào thành, lửa thề bật giữa thành; theo thanh kéo (5 giờ sáng → 11 giờ trưa): người (son) giữ bốn cửa thành; tàu (xanh nhạt) áp sát bờ sông, lửa bùng dần trên tường đông; quân (xanh nhạt) đổ bộ tiến vào thành; đốm ngà ở Võ Miếu lịm dần; người (son) đến rồi lặng lẽ rước ra khỏi thành; đốm vàng dịu giữa thành; vài nhóm người (son) đi qua lại; tàu (xanh nhạt) đậu bên sông
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,170,-300], look: [20,0,40], mood: MOOD.dawn + 0.3 },
    "tong-doc": { ...shot([-20, 0, 60], 70, 260, 130, 1), mood: MOOD.day },
    "don-thuy": { ...shot([180, 0, -120], 20, 260, 120, -1), mood: MOOD.sunset + 0.5 },
    "buoi-sang": { ...shot([20, 0, 40], 70, 240, 110, 1), mood: MOOD.day },
    "vo-mieu": { ...shot([VO_MIEU[0], 0, VO_MIEU[1]], 70, 200, 90, -1), mood: MOOD.sunset + 0.3 },
    "ve-sau": { ...shot([0, 0, 20], 80, 300, 150, 1), mood: MOOD.sunset + 0.3 },
  },
};

export default config;
