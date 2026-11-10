import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thăng Long (THANG_LONG) bắc; Đồng Cổ (DONG_CO) tây bắc; Trường Yên (TRUONG_YEN) nam.
// Hoạt cảnh trong từng phân cảnh: quân ba vương (xanh nhạt) từ ba phía kéo đến vây thành; đốm vàng (thái tử) trong điện; vệ sĩ (son) từ cửa thành xông ra; một cánh quân (xanh nhạt) ngã, phần còn lại tan chạy; theo thanh kéo, đạo quân của vua (son) tiến về Trường Yên; đốm ngà (Khai Quốc vương) ở Trường Yên chuyển sang vàng khi quân tới; các quan (chấm ngà) từ kinh thành đến đền Đồng Cổ đọc lời thề; đốm vàng ở đền
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "vay-thanh": { ...shot([40, 0, 150], 80, 270, 150, 1), mood: MOOD.dawn + 0.5 },
    "ra-thanh": { ...shot([40, 0, 100], 85, 240, 110, -1), mood: MOOD.sunset + 0.55 },
    "truong-yen": { ...shot([-20, 0, -180], 270, 270, 150, 1), mood: MOOD.sunset + 0.6 },
    "dong-co": { ...shot([-60, 0, 190], 90, 250, 130, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
