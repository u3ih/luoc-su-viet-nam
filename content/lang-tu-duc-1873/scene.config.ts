import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { LANG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Khu lăng (LANG) giữa thung lũng; núi Giáng Khiêm (nam), Dương Xuân (bắc); hồ (HO); kinh thành (KINH) xa phía bắc.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (vua) từ kinh thành xa về thung lũng; đốm vàng nhỏ đánh dấu nơi chọn đất; theo thanh kéo, từng đợt lính và dân phu (son) kéo về đắp la thành; vòng thành cao dần; vài đốm son nhấp nháy (oán giận); gần năm mươi đốm vàng nhỏ (các công trình mang chữ Khiêm) sáng dần trong la thành; hồ phản chiếu; đốm ngà lớn (bia Khiêm Cung ký) sáng; về sau đốm vàng (vua) lịm
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "chon-dat": { ...shot([LANG[0], 0, LANG[1]], 90, 280, 150, 1), mood: MOOD.dawn + 0.5 },
    "xay-lang": { ...shot([LANG[0], 0, LANG[1]], 80, 260, 140, -1), mood: MOOD.overcast + 0.3 },
    "khiem-cung": { ...shot([LANG[0], 0, LANG[1]], 70, 200, 90, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([30, 0, 60], 80, 150, 60, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
