import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CENTER, FESTIVAL, FIELDS, FIND, FOUNDRY } from "./places";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem places.ts, terrain.ts): ba dòng sông gặp nhau ở (-60, -20) rồi thành sông lớn chảy ra đông; làng lớn ở khoảng (0, 70),
// xưởng đúc đồng ở (-32, 114), bãi hội ở (62, 118), ruộng thấp ven sông ở khoảng (144, 2); chỗ lộ đồ đồng bên bờ ở (-108, 36).
// trieu: 0 = triều rút, 1 = triều lên (người xem kéo ở phân cảnh "ruong-nuoc"); các phân cảnh khác giữ mực nước vừa (0.3).
// Hoạt cảnh trong từng phân cảnh (đồ đồng lộ bờ sông, làng lớn dần, đốm di tích dọc ba sông, ruộng và trâu bò, lò đúc, ngày hội,
// mười một trung tâm, các dòng giao lưu) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const mid = { trieu: 0.3 };
const config: SceneConfig = {
  params: { trieu: 0.3 },
  keyframes: {
    "mo-dau": { cam: [270, 115, 230], look: [-20, 5, 40], mood: MOOD.dawn + 0.2 },
    "phat-hien": { ...shot([FIND[0], 3, FIND[1]], 95, 105, 38, 1), mood: MOOD.overcast - 0.15, fov: 48, params: mid },
    "thoi-gian": { ...shot([CENTER[0], 4, CENTER[1]], 60, 200, 80, -1, 0.25), mood: MOOD.dawn + 0.8, params: mid },
    "phan-bo": { ...shot([-60, 0, 20], 100, 270, 150, 1, 0.25), mood: MOOD.dawn + 0.9, params: mid },
    "ruong-nuoc": { ...shot([(FIELDS.x0 + FIELDS.x1) / 2, 1, (FIELDS.z0 + FIELDS.z1) / 2], 160, 105, 38, -1), mood: MOOD.dawn + 0.6, fov: 48, params: { trieu: 0 } },
    "dong": { ...shot([FOUNDRY[0], 5, FOUNDRY[1]], 30, 80, 26, 1), mood: MOOD.sunset - 0.05, fov: 48, params: mid },
    "le-hoi": { ...shot([FESTIVAL[0], 4, FESTIVAL[1]], 250, 90, 34, -1), mood: MOOD.sunset + 0.6, params: mid },
    "trung-tam": { ...shot([-20, 0, 30], 80, 300, 330, 1, 0.2), mood: MOOD.sunset + 0.45, fov: 52, params: mid },
    "giao-luu": { ...shot([0, 0, 0], 70, 330, 190, -1, 0.25), mood: MOOD.dawn + 0.35, params: mid },
  },
};

export default config;
