import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { DAI_LA, HL } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hoa Lư ở (-190, -270) giữa núi đá vôi (phía nam), Đại La ở (20, 255) bên bờ tây sông lớn (phía bắc),
// sông nhỏ nối hai nơi ở phía đông nam. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (người tụ về ở Hoa Lư, vệt sáng "nhìn ra" đồng bằng, ánh chiếu bay tới Đại La và người đông dần,
// đoàn thuyền đi theo sông, rồng vàng và ánh đèn thành mới) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [330, 110, -330], look: [-40, 10, -60], mood: MOOD.dawn },
    "len-ngoi": { ...shot([HL[0], 8, HL[1]], 35, 150, 55, 1), mood: MOOD.dawn + 0.7 },
    "hoa-lu-chat": { ...shot([HL[0] + 30, 20, HL[1] + 20], 200, 190, 90, -1), mood: MOOD.overcast + 0.4 },
    chieu: { ...shot([DAI_LA[0], 5, DAI_LA[1]], 280, 210, 100, 1), mood: MOOD.day - 0.4 },
    "xuoi-song": { ...shot([40, 0, -30], 120, 380, 280, -1, 0.15), mood: MOOD.day - 0.2 },
    "thang-long": { ...shot([DAI_LA[0] + 30, 5, DAI_LA[1] - 5], 185, 130, 50, 1), mood: MOOD.sunset + 0.2 },
  },
};

export default config;
