import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HOANG_THANH, KHAI_QUAT } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hoàng thành (HOANG_THANH), núi Nùng (NUI_NUNG), khu khai quật (KHAI_QUAT); sông Hồng phía đông.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (điện Kính Thiên) trên núi Nùng; các đốm theo thời gian lần lượt sáng (Lý, Trần, Lê, Nguyễn); theo thanh kéo, các lớp đốm (tầng văn hóa) lộ ra trong hố khai quật: mỗi lớp một màu, chồng lên nhau; đốm ngà lớn (xếp hạng di tích quốc gia đặc biệt) sáng giữa hoàng thành; đêm: vòng đốm vàng quanh hoàng thành (nghìn năm Thăng Long); đốm vàng lớn trên cao (ghi danh)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "nghin-nam": { ...shot([HOANG_THANH[0], 0, HOANG_THANH[1]], 80, 260, 140, 1), mood: MOOD.dawn + 0.5 },
    "khai-quat": { ...shot([KHAI_QUAT[0], 0, KHAI_QUAT[1]], 80, 120, 50, -1), mood: MOOD.day },
    "xep-hang": { ...shot([HOANG_THANH[0], 0, HOANG_THANH[1]], 70, 220, 110, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([HOANG_THANH[0], 0, HOANG_THANH[1]], 80, 260, 140, -1), mood: MOOD.sunset + 0.75 },
  },
};

export default config;
