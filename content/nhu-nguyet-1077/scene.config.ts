import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CAMP_N, TEMPLE, UNG, riverZ } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Như Nguyệt chảy từ tây sang đông qua z ≈ 10–35; bờ nam là phòng tuyến quân Lý, bờ bắc là trại quân Tống;
// dải đồi biên giới ở z ≈ 235 (hai lối đi ở x ≈ -180 và 190), phía bắc dải đồi là ba thành Ung (-120, 330), Liêm (130, 350), Khâm (270, 335). Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (hai đạo quân tiến sang đất Tống, vây thành rồi rút về, dựng cọc, quân Tống vượt sông thất bại, ánh sáng từ đền,
// phản công ban đêm, quân Tống rút và sứ giả) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-240, 90, -300], look: [30, 5, 30], mood: MOOD.dawn },
    "tien-phat": { ...shot([40, 0, 190], 90, 300, 200, 1, 0.2), mood: MOOD.overcast },
    "ung-chau": { ...shot([UNG[0], 5, UNG[1] - 10], 20, 150, 60, -1), mood: MOOD.overcast + 0.3 },
    "phong-tuyen": { ...shot([20, 0, riverZ(20) - 12], 110, 130, 42, 1), mood: MOOD.day - 0.5 },
    "quach-quy": { ...shot([20, 0, 50], 270, 230, 110, -1, 0.25), mood: MOOD.overcast },
    "tho-than": { ...shot([TEMPLE[0], 8, TEMPLE[1]], 80, 140, 40, 1), mood: MOOD.night - 0.1 },
    "phan-cong": { ...shot([-60, 0, 60], 100, 250, 120, -1, 0.25), mood: MOOD.night - 0.4 },
    "hoa-nghi": { ...shot([CAMP_N[0], 0, CAMP_N[1]], 80, 300, 160, 1, 0.2), mood: MOOD.dawn + 0.6 },
  },
};

export default config;
