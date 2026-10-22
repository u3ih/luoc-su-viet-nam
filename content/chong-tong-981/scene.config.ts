import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { COURT, STAKE_X, riverZ } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): sông lớn chảy từ tây sang đông (x tăng dần là hướng ra biển), thung lũng đường bộ ở phía tây bắc, đồi họp triều
// ở phía tây nam (COURT), bãi cọc ngầm trên sông ở x ≈ -40 (STAKE_X). Mọi vị trí là gợi ý, không phải bản đồ thật.
// Hoạt cảnh trong từng phân cảnh (người tụ về đồi họp triều, hai đạo quân Tống tiến xuống, bãi cọc trồi lên, thủy quân tiến vào sông,
// giả hàng rồi phục kích, quân Tống rút lui) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const stakes: [number, number, number] = [STAKE_X, 0, riverZ(STAKE_X)];

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [330, 95, -260], look: [0, 5, -20], mood: MOOD.dawn },
    "nhiep-chinh": { ...shot([COURT[0], 6, COURT[1]], 200, 150, 55, 1), mood: MOOD.overcast + 0.3 },
    "dong-song": { ...shot([60, 0, 20], 15, 340, 175, -1, 0.2), mood: MOOD.overcast },
    "coc-ngam": { ...shot(stakes, 250, 115, 40, 1), mood: MOOD.day - 0.3 },
    "bach-dang": { ...shot([-10, 0, riverZ(-10)], 200, 150, 48, -1), mood: MOOD.day - 0.5 },
    "gia-hang": { ...shot([-30, 0, riverZ(-30)], 300, 105, 38, 1, 0.3), mood: MOOD.sunset - 0.5 },
    "ket-qua": { ...shot([90, 0, 0], 20, 320, 150, -1, 0.25), mood: MOOD.sunset + 0.3 },
  },
};

export default config;
