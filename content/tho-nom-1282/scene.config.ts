import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông giữa; Thăng Long (THANG_LONG_T) bờ tây.
// Hoạt cảnh trong từng phân cảnh: một đốm vàng (bài văn) bay từ bờ ra giữa sông rồi chìm; gợn sóng (đốm ngà) lan rồi tắt; ở kinh thành, các đốm ngà (bài thơ Nôm) lần lượt sáng; người (son) tụ quanh nghe đọc; theo thanh kéo, một dải đốm vàng nối dài từ bờ sông (Hàn Thuyên) qua kinh thành tới cung (hội Tao đàn) — dòng thơ Nôm qua các thế kỷ; hai mươi tám đốm ngà (hội Tao đàn nhị thập bát tú) xếp vòng quanh một đốm vàng (vua Lê Thánh Tông)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "ca-sau": { ...shot([40, 0, 40], 0, 160, 60, 1), mood: MOOD.dawn + 0.5 },
    "quoc-ngu": { ...shot([-60, 0, 20], 60, 170, 90, -1), mood: MOOD.day },
    "nguyen-trai": { ...shot([0, 0, 0], 90, 230, 130, 1), mood: MOOD.sunset + 0.6 },
    "hong-duc": { ...shot([-60, 0, 20], 110, 170, 90, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
