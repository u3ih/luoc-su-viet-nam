import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đình làng (DINH) giữa.
// Hoạt cảnh trong từng phân cảnh: các đình làng (đốm ngà) khắp vùng lần lượt sáng; người nghe (son) tìm đến; các nhà nho (chấm ngà) tụ về đình; đốm vàng (bài hát nói) sáng lên; theo thanh kéo, ba đốm (đào nương vàng, kép đàn đáy ngà, quan viên son) sáng; vòng đốm nhỏ quanh (tiếng phách, tiếng trống chầu) lan ra; mười sáu đốm vàng (các tỉnh, thành trong hồ sơ) lần lượt sáng khắp nửa phía bắc
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "ten-goi": { ...shot([0, 0, 40], 75, 270, 160, 1), mood: MOOD.dawn + 0.5 },
    "hat-noi": { ...shot([0, 0, 40], 85, 210, 120, -1), mood: MOOD.sunset + 0.6 },
    "chau-hat": { ...shot([0, 0, 40], 85, 150, 80, 1), mood: MOOD.sunset + 0.75 },
    "ve-sau": { ...shot([0, 0, 20], 80, 270, 170, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
