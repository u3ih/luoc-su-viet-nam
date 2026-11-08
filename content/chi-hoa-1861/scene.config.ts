import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { DAI_DON, PHONG_TUYEN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đại đồn (DAI_DON) tây bắc; phòng tuyến các chùa (PHONG_TUYEN) đông nam; Biên Hòa (BIEN_HOA) đông bắc; Gò Công (GO_CONG) nam.
// Hoạt cảnh trong từng phân cảnh: toán quân Pháp nhỏ (xanh nhạt) giữ phòng tuyến các chùa; tàu (xanh nhạt) rời đi xa rồi trở lại đông hơn; quân Việt (son) đắp lũy quanh đại đồn; vòng lũy cao dần; theo thanh kéo (rạng sáng 24 → tối 25): đại bác từ phòng tuyến và tàu bắn (lửa); quân Pháp (xanh nhạt) tiến vào; quân trong đồn (son) giữ rồi lui về Biên Hòa; lửa âm ỉ trong đồn; quân Pháp (xanh nhạt) tỏa đi các tỉnh; một toán (son) rút về Gò Công
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "boi-canh": { ...shot([PHONG_TUYEN[0], 0, PHONG_TUYEN[1]], 60, 220, 110, 1), mood: MOOD.overcast + 0.4 },
    "dap-luy": { ...shot([DAI_DON[0], 0, DAI_DON[1]], 60, 280, 150, -1), mood: MOOD.day },
    "tan-cong": { ...shot([-40, 0, 0], 120, 300, 160, 1), mood: MOOD.dawn + 0.2 },
    "ve-sau": { ...shot([DAI_DON[0], 0, DAI_DON[1]], 60, 260, 140, -1), mood: MOOD.sunset + 0.75 },
  },
};

export default config;
