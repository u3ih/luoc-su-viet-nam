import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (HA_NOI), khoảng trống (MAT) bắc; Huế (HUE) giữa; Sài Gòn (SAI_GON) nam.
// Hoạt cảnh trong từng phân cảnh: năm đốm ngà (năm vạt áo ngũ thân, cách điệu) xếp cạnh nhau; phụ nữ (son) đi chợ; theo thanh kéo, năm đốm thu về thành hai cột dài (hai tà áo); cột phía trước dài chấm đất; một chấm vàng (hoạ sĩ) đi từ Hà Nội vào Huế, Sài Gòn; ở mỗi nơi, phụ nữ (son) ra phố, đốm ngà (áo dài) sáng; hai đốm (Cát Tường: vàng; Lê Phổ: ngà) ở Hà Nội; đốm ngà rời đi phương xa (1937)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "ngu-than": { ...shot([40, 0, 130], 80, 170, 90, 1), mood: MOOD.dawn + 0.5 },
    "phong-hoa": { ...shot([40, 0, 130], 85, 160, 90, -1), mood: MOOD.sunset + 0.7 },
    "xuyen-viet": { ...shot([60, 0, 0], 85, 270, 160, 1), mood: MOOD.sunset + 0.6 },
    "le-pho": { ...shot([-20, 0, 200], 80, 200, 110, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
