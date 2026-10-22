import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CAN_TRAM, LE_HOA, MA_YEN, PHO_CAT, XUONG_GIANG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thung lũng hẹp Chi Lăng ở phía bắc (núi Mã Yên giữa lòng thung, MA_YEN), đường cái chạy xuống
// phía nam qua Cần Trạm, Phố Cát tới cánh đồng Xương Giang bên sông Thương (XUONG_GIANG). Mép tây bắc là hướng Lê Hoa. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (vây và hạ thành Xương Giang, hai đạo viện binh tràn vào, nhử địch vào ải rồi phục kích, chặn đánh dọc
// đường, vây trại giữa đồng, Mộc Thạnh rút chạy) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [300, 170, -330], look: [0, 20, 60], mood: MOOD.dawn + 0.3 },
    "thanh-xuong-giang": { ...shot([XUONG_GIANG[0], 3, XUONG_GIANG[1]], 70, 220, 110, 1), mood: MOOD.overcast + 0.4 },
    "vien-binh": { ...shot([-40, 10, 290], 95, 400, 270, -1, 0.15), mood: MOOD.overcast + 0.5 },
    "chi-lang": { ...shot([MA_YEN[0] - 10, 10, MA_YEN[1] + 20], 95, 260, 175, 1, 0.2), mood: MOOD.day },
    "can-tram": { ...shot([(CAN_TRAM[0] + PHO_CAT[0]) / 2, 5, (CAN_TRAM[1] + PHO_CAT[1]) / 2], 60, 300, 170, -1, 0.25), mood: MOOD.day },
    "xuong-giang": { ...shot([XUONG_GIANG[0], 3, XUONG_GIANG[1] + 20], 110, 240, 140, 1), mood: MOOD.sunset - 0.3 },
    "moc-thanh": { ...shot([LE_HOA[0] + 60, 10, LE_HOA[1] - 30], 140, 300, 170, -1, 0.2), mood: MOOD.sunset + 0.3 },
  },
};

export default config;
