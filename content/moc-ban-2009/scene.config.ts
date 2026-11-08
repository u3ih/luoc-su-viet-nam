import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { QUOC_SU_QUAN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh thành Huế (KINH), Quốc sử quán (QUOC_SU_QUAN); VAN_MIEU_HN hướng bắc.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (vua phê duyệt) truyền sang đốm ngà (Quốc sử quán); người (son, thợ khắc) tụ về; theo thanh kéo, lưới đốm ngà (ván khắc) lần lượt hoàn thành, xếp thành từng dãy; những đốm ngà (ván in ở Văn Miếu Hà Nội) theo đường dài về Huế; khối đốm ngà (34.618 tấm) sáng dịu; đốm vàng lớn (ghi danh) phía trên
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "quoc-su-quan": { ...shot([QUOC_SU_QUAN[0], 0, QUOC_SU_QUAN[1]], 80, 180, 80, 1), mood: MOOD.day },
    "khac-ban": { ...shot([QUOC_SU_QUAN[0], 0, QUOC_SU_QUAN[1]], 80, 120, 40, -1), mood: MOOD.sunset + 0.6 },
    "van-mieu": { ...shot([-100, 0, 250], 80, 330, 180, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([QUOC_SU_QUAN[0], 0, QUOC_SU_QUAN[1]], 70, 180, 80, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
