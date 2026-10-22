import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { BO_CO, MO_DO } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Đáy chảy từ bắc xuống nam, ra biển ở góc đông nam; Mô Độ trong vùng núi đá vôi phía
// tây nam (MO_DO); bến Bô Cô bên bờ tây sông (BO_CO). Mép bắc là hướng Đông Quan, mép nam là hướng Nghệ An. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (quân Minh toả đi các đồn, nghĩa quân tụ về Mô Độ, trận Bô Cô, hai tướng bị giết và quân chia đôi,
// Trùng Quang lên ngôi ở phía nam, lửa các đồn nghĩa quân tắt dần, một người bên sông dưới trăng) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [340, 130, -300], look: [-20, 10, 30], mood: MOOD.dawn + 0.2 },
    "giao-chi": { ...shot([0, 0, 60], 90, 470, 300, 1, 0.2), mood: MOOD.overcast + 0.2 },
    "mo-do": { ...shot([MO_DO[0] + 40, 8, MO_DO[1] - 20], 230, 180, 95, -1), mood: MOOD.dawn + 0.6 },
    "bo-co": { ...shot([BO_CO[0] + 10, 2, BO_CO[1]], 160, 200, 90, 1), mood: MOOD.day },
    "nghi-ky": { ...shot([BO_CO[0] - 40, 2, BO_CO[1] - 60], 250, 300, 170, -1, 0.2), mood: MOOD.overcast + 0.5 },
    "trung-quang": { ...shot([-110, 2, -230], 270, 330, 190, 1, 0.2), mood: MOOD.sunset - 0.4 },
    "nhung-ngay-cuoi": { ...shot([0, 0, -100], 270, 420, 260, -1, 0.2), mood: MOOD.sunset },
    "thuat-hoai": { ...shot([140, 2, -200], 300, 120, 32, 1), mood: MOOD.night },
  },
};

export default config;
