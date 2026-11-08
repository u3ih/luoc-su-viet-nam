import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { THUY_KHUE } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Làng Thụy Khuê (THUY_KHUE) dưới chân núi Thầy (NUI_THAY); HUE là hướng kinh đô phía nam.
// Hoạt cảnh trong từng phân cảnh: đốm ngà (Phan Huy Chú) ở làng; hai lần đi thi (chấm ngà ra đi, về), mỗi lần một đốm vàng nhỏ (đỗ tú tài); theo thanh kéo, mười đốm vàng (mười phần sách) lần lượt sáng thành vòng quanh đốm ngà; đốm ngà mang mười đốm vàng đi về phía nam (kinh đô Huế); các đốm vàng (bản in, bản dịch) lan ra khắp vùng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "kep-thay": { ...shot([THUY_KHUE[0], 0, THUY_KHUE[1]], 80, 220, 100, 1), mood: MOOD.day },
    "soan-sach": { ...shot([THUY_KHUE[0], 0, THUY_KHUE[1]], 80, 160, 60, -1), mood: MOOD.sunset + 0.65 },
    "dang-sach": { ...shot([60, 0, -150], 270, 260, 160, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([0, 0, 0], 80, 360, 190, -1), mood: MOOD.sunset + 0.55 },
  },
};

export default config;
