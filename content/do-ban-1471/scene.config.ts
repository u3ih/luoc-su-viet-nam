import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CHAU_HOA, DO_BAN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông, núi ở phía tây; thành Đồ Bàn (DO_BAN) ở đồng bằng phía nam; cửa biển phía bắc (CUA_BAC) và cửa Thi Nại (THI_NAI) bên bờ; châu Hoá (CHAU_HOA) ở phía bắc. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (người và đốm sáng hai phía, đoàn quân đi từ bắc xuống, quân đường bộ và đường biển tiến vào vây Đồ Bàn theo thanh kéo, đốm sáng chia ba, đoàn người đi lại)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [320, 190, -320], look: [-30, 0, 30], mood: MOOD.dawn + 0.3 },
    "nguyen-nhan": { ...shot([CHAU_HOA[0], 0, CHAU_HOA[1] - 30], 160, 240, 120, 1), mood: MOOD.overcast + 0.3 },
    "xuat-quan": { ...shot([10, 0, 150], 170, 330, 200, -1), mood: MOOD.dawn + 0.7 },
    "vay-thanh": { ...shot([DO_BAN[0] + 30, 0, DO_BAN[1]], 170, 270, 140, 1), mood: MOOD.overcast + 0.8 },
    "hau-qua": { ...shot([0, 0, -20], 165, 380, 230, -1), mood: MOOD.sunset },
    "lang-gieng": { ...shot([DO_BAN[0] + 20, 0, DO_BAN[1] + 20], 150, 250, 130, 1), mood: MOOD.sunset - 0.2 },
  },
};

export default config;
