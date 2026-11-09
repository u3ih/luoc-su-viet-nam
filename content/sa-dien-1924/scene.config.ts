import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Châu Giang ngang giữa cảnh; đảo Sa Diện (SA_DIEN); thành phố (QUANG_CHAU) bờ bắc.
// Hoạt cảnh trong từng phân cảnh: nhóm thanh niên (chấm ngà) từ phương nam xa vượt sang Quảng Châu; theo thanh kéo, khách (xanh nhạt) lần lượt qua cầu sang đảo, khách sạn (đốm vàng) sáng đèn; một chấm ngà lẫn vào cuối; chấm ngà rời đảo ra mép sông rồi lịm dần dưới nước; người truy đuổi (xanh nhạt) toả quanh đảo; mộ ở Hoàng Hoa Cương (đốm vàng); người đến viếng (son)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "roi-que": { ...shot([-120, 0, 0], 65, 330, 190, 1), mood: MOOD.dawn + 0.5 },
    "sa-dien": { ...shot([10, 0, 20], 80, 200, 80, -1), mood: MOOD.sunset + 0.75 },
    "chau-giang": { ...shot([40, 0, -20], 90, 200, 80, 1), mood: MOOD.sunset + 0.75 },
    "ve-sau": { ...shot([-150, 0, 230], 80, 240, 110, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
