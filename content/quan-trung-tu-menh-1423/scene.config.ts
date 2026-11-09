import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Doanh trại Lam Sơn (DOANH) tây nam; các thành quân Minh (THANH_*) đông, bắc.
// Hoạt cảnh trong từng phân cảnh: doanh trại Lam Sơn (đốm vàng); lá thư đầu tiên (đốm ngà) đi tới thành quân Minh phía bắc; theo thanh kéo, thư từ (đốm ngà) lần lượt tới các thành quân Minh (xanh nhạt); các đời sau gom chép: nhà nho (ngà) tụ lại; chồng sách (cột đốm vàng) cao dần; các bài văn (đốm ngà) — 62 bài cũ và 30 bài tìm thêm — sáng lên
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "thu-dau": { ...shot([-80, 0, 60], 70, 330, 180, 1), mood: MOOD.dawn + 0.5 },
    "thu-tu": { ...shot([20, 0, 60], 75, 330, 190, -1), mood: MOOD.sunset + 0.6 },
    "bien-tap": { ...shot([-40, 0, 40], 80, 180, 70, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([-40, 0, 40], 90, 220, 100, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
