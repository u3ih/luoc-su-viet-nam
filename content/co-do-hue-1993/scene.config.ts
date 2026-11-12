import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh thành (KINH_THANH) bờ bắc sông Hương; lăng (LANG) tây nam; núi Ngự (NUI_NGU) nam.
// Hoạt cảnh trong từng phân cảnh: các công trình trong Kinh thành (đốm vàng) sáng thành lưới; các lăng vua (đốm ngà) ở vùng đồi tây nam; phần lớn các đốm trong Kinh thành tắt dần, chỉ còn vài đốm (những công trình còn lại); theo thanh kéo, các công trình trong Kinh thành và các lăng lần lượt sáng lại (di sản thế giới); thợ trùng tu (son) làm việc trong hoàng thành; hai khuyết đài (đốm ngà) phía tây và đông lần lượt dựng lại
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "kinh-do": { ...shot([0, 0, 20], 75, 260, 150, 1), mood: MOOD.dawn + 0.5 },
    "tan-pha": { ...shot([20, 0, 70], 80, 220, 140, -1), mood: MOOD.sunset + 0.6 },
    "ghi-danh": { ...shot([-40, 0, -20], 70, 270, 160, 1), mood: MOOD.sunset + 0.7 },
    "trung-tu": { ...shot([20, 0, 70], 85, 200, 110, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
