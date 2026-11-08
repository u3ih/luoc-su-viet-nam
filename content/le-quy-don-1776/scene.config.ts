import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển phía đông; Diên Hà (DIEN_HA), kinh đô (KINH) bắc; Thuận Hóa (THUAN_HOA), Quảng Nam (QUANG_NAM) nam.
// Hoạt cảnh trong từng phân cảnh: đốm ngà đi từ Diên Hà lên kinh đô; ba đốm vàng sáng lần lượt (ba lần đỗ đầu); người (son) gặp hạn hán tụ về kinh đô; chín đốm vàng (các mục của sách) sáng dần quanh kinh đô; đốm ngà đi từ kinh đô vào Thuận Hóa; các đốm vàng (trang ghi chép) phủ dần khắp Thuận Hóa, Quảng Nam theo thanh kéo; bốn mươi đốm vàng nhỏ (bốn mươi bộ sách) sáng dần quanh kinh đô
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [40,0,40], mood: MOOD.dawn + 0.3 },
    "do-dau": { ...shot([30, 0, 300], 90, 260, 130, 1), mood: MOOD.day },
    "van-dai": { ...shot([KINH[0], 0, KINH[1]], 90, 230, 110, -1), mood: MOOD.sunset + 0.5 },
    "thuan-hoa": { ...shot([80, 0, -150], 270, 330, 170, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([KINH[0], 0, KINH[1]], 80, 240, 120, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
