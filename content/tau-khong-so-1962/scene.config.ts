import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hải Phòng (HAI_PHONG) bắc; Vũng Rô (VUNG_RO) giữa; Vàm Lũng (VAM_LUNG) nam; biển phía đông.
// Hoạt cảnh trong từng phân cảnh: theo thanh kéo, con tàu (đốm vàng) rời bến Hải Phòng, đi xa bờ ra khơi rồi vòng vào bến Vàm Lũng (đốm ngà); con tàu (đốm vàng) lẫn giữa đoàn thuyền đánh cá (chấm ngà) ngoài khơi; tàu (đốm vàng) neo sát vách núi Vũng Rô; máy bay (đốm xanh nhạt) lượn trên cao; ánh lửa khi huỷ tàu; nhiều chuyến tàu (đốm vàng) đi vòng xa bờ tới nhiều bến (đốm ngà) dọc bờ phía nam
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "phuong-dong-1": { ...shot([40, 0, 40], 100, 290, 170, 1), mood: MOOD.sunset + 0.7 },
    "nguy-trang": { ...shot([60, 0, 100], 90, 160, 60, -1), mood: MOOD.day },
    "vung-ro": { ...shot([-100, 0, 20], 180, 170, 80, 1), mood: MOOD.sunset + 0.6 },
    "doan-125": { ...shot([60, 0, 0], 95, 280, 170, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
