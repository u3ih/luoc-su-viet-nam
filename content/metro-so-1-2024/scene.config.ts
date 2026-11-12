import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Bến Thành (BEN_THANH) tây nam; sông Sài Gòn giữa; Suối Tiên (SUOI_TIEN) đông bắc.
// Hoạt cảnh trong từng phân cảnh: hai đầu tuyến (đốm vàng) sáng; một đường đốm ngà mờ (tuyến quy hoạch) nối hai đầu; thợ (son) làm dọc tuyến; các trụ, ga (đốm vàng) mọc lên chậm rãi; theo thanh kéo, đoàn tàu (chuỗi chấm vàng) chạy từ Bến Thành, ba ga ngầm (đốm thấp), qua sông lên cao tới Suối Tiên; hành khách (son) xuống ga Bến Thành và lên tàu; các đoàn tàu (chấm vàng) nối nhau chạy
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "du-an": { ...shot([0, 0, 40], 70, 270, 170, 1), mood: MOOD.dawn + 0.5 },
    "cham-tre": { ...shot([0, 0, 40], 80, 260, 160, -1), mood: MOOD.sunset + 0.55 },
    "tuyen": { ...shot([-60, 0, -20], 40, 220, 110, 1), mood: MOOD.sunset + 0.6 },
    "van-hanh": { ...shot([-180, 0, -100], 60, 200, 100, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
