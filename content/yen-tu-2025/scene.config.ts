import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đỉnh Yên Tử (DINH_YT) bắc; Hoa Yên (HOA_YEN) sườn; Vĩnh Nghiêm (VINH_NGHIEM) tây; Côn Sơn (CON_SON), Kiếp Bạc (KIEP_BAC) đông nam.
// Hoạt cảnh trong từng phân cảnh: đoàn hành hương (ngà) theo đường núi từ chân núi lên đỉnh Yên Tử; đốm vàng (chùa Đồng) trên đỉnh, đốm ngà ở Hoa Yên; từ Yên Tử, đốm sáng lan tới Vĩnh Nghiêm (truyền bá) rồi Côn Sơn – Kiếp Bạc (phục hưng); dòng người (ngà) nối các nơi; theo thanh kéo, mười hai điểm di tích (đốm vàng) lần lượt sáng lên, nối Yên Tử với Vĩnh Nghiêm và Côn Sơn – Kiếp Bạc; cả mười hai đốm vàng sáng rực; vòng sáng toả ra; người dân (ngà) đứng ở chân núi Yên Tử đón bằng di sản
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "yen-tu": { ...shot([10, 0, 120], 90, 220, 110, 1), mood: MOOD.dawn + 0.5 },
    "vinh-nghiem": { ...shot([-20, 0, -60], 70, 220, 120, -1), mood: MOOD.day },
    "ho-so": { ...shot([0, 0, 20], 90, 260, 150, 1), mood: MOOD.sunset + 0.6 },
    "paris": { ...shot([10, 0, 60], 100, 220, 120, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
