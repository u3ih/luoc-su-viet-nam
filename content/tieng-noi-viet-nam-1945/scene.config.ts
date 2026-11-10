import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (HA_NOI) giữa; Hải Phòng (HAI_PHONG) đông.
// Hoạt cảnh trong từng phân cảnh: vài đốm xanh nhạt mờ (các đài tư nhân nhỏ) ở xa; đồng bằng còn tối; người (son) tụ về Hà Nội; đốm vàng (nơi phát sóng) sáng lên; theo thanh kéo, làn sóng phát thanh (các vòng đốm vàng) lan dần ra xa; các làng xa (đốm ngà) lần lượt sáng — người nghe khắp nơi; thêm những đốm vàng (kênh mới)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "truoc-1945": { ...shot([100, 0, -60], 70, 290, 190, 1), mood: MOOD.dawn + 0.5 },
    "lap-dai": { ...shot([0, 0, 0], 80, 220, 120, -1), mood: MOOD.sunset + 0.55 },
    "phat-song": { ...shot([0, 0, 0], 75, 330, 240, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([0, 0, 0], 85, 340, 250, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
