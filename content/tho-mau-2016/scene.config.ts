import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Phủ thờ (PHU) ở cửa sông; núi phía tây; biển phía đông.
// Hoạt cảnh trong từng phân cảnh: các đền thờ nữ thần (đốm ngà) lần lượt sáng khắp vùng; ba đốm (Tam toà): đốm vàng trên cao, đốm ngà trên núi rừng, đốm xanh nhạt bên sông nước; theo thanh kéo, các giá hầu (đốm vàng) lần lượt sáng thành vòng trong phủ; người dự lễ (son) ngồi quanh; mười bốn đốm vàng (các tỉnh trong hồ sơ) sáng; đốm vàng lớn ở phủ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "nu-than": { ...shot([0, 0, 0], 75, 270, 170, 1), mood: MOOD.dawn + 0.5 },
    "tam-phu": { ...shot([60, 0, 40], 70, 220, 120, -1), mood: MOOD.sunset + 0.6 },
    "hau-dong": { ...shot([100, 0, 60], 85, 150, 80, 1), mood: MOOD.sunset + 0.75 },
    "ve-sau": { ...shot([0, 0, 0], 80, 270, 180, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
