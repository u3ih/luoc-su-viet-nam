import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { QUANG_NAM } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển phía đông; Quảng Nam (QUANG_NAM) giữa; Hà Tĩnh (HA_TINH) bắc; Quảng Ngãi (QUANG_NGAI), Bình Thuận (BINH_THUAN) nam.
// Hoạt cảnh trong từng phân cảnh: ba đốm ngà (ba nhà duy tân) gặp nhau ở Quảng Nam; người (son) tụ lại nghe; ba đốm ngà tỏa đi khắp các làng theo thanh kéo; các đốm vàng (trường học, hiệu buôn) lần lượt sáng; các đám đông (son) bị giải tán; đốm ngà ở Hà Tĩnh chuyển xuống Bình Thuận; đốm ngà ở Quảng Ngãi chập chờn; các đốm vàng lịm dần; những chấm xanh nhạt (người bị đày) theo thuyền ra biển xa
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "chu-truong": { ...shot([QUANG_NAM[0], 0, QUANG_NAM[1]], 80, 220, 100, 1), mood: MOOD.day },
    "van-dong": { ...shot([40, 0, 0], 85, 360, 180, -1), mood: MOOD.sunset + 0.4 },
    "ngan-tro": { ...shot([60, 0, -60], 270, 340, 170, 1), mood: MOOD.overcast + 0.4 },
    "ve-sau": { ...shot([QUANG_NAM[0], 0, QUANG_NAM[1]], 80, 260, 130, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
