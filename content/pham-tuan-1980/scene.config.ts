import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { BE_PHONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Bệ phóng (BE_PHONG) giữa thảo nguyên.
// Hoạt cảnh trong từng phân cảnh: những chấm sáng (máy bay huấn luyện) lượn vòng trên trời; đốm ngà (học viên) dưới mặt đất; theo thanh kéo, đốm sáng trắng (tàu Soyuz 37) rời bệ phóng bay vút lên cao, để lại vệt lửa; vòng đốm sáng cao trên trời (quỹ đạo, trạm Salyut 6); đốm xanh (bèo hoa dâu) nhỏ bên cạnh; đốm sáng hạ dần xuống thảo nguyên (Soyuz 36 trở về); người (son) chạy tới đón
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "phi-cong": { ...shot([0, 0, 0], 80, 300, 120, 1), mood: MOOD.day },
    "phong-tau": { ...shot([BE_PHONG[0], 0, BE_PHONG[1]], 90, 360, 50, -1), mood: MOOD.sunset + 0.6 },
    "thi-nghiem": { ...shot([BE_PHONG[0], 0, BE_PHONG[1]], 90, 380, 70, 1), mood: MOOD.sunset + 0.85 },
    "ve-sau": { ...shot([BE_PHONG[0], 0, BE_PHONG[1]], 70, 300, 100, -1), mood: MOOD.dawn + 0.4 },
  },
};

export default config;
