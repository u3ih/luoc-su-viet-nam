import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Bảo tàng (BAO_TANG) bờ tây sông Hàn; các di tích (MY_SON, TRA_KIEU, DONG_DUONG) tây nam.
// Hoạt cảnh trong từng phân cảnh: các di tích Chăm (đốm xanh nhạt) sáng; di vật (chấm vàng) được chở về Đà Nẵng; theo thanh kéo, các tác phẩm điêu khắc (lưới đốm vàng) lần lượt được đặt vào bảo tàng bên sông; một phần hiện vật (đốm) mất đi rồi được thu hồi; người canh gác (ngà) đứng quanh bảo tàng; bảo tàng mở rộng: thêm lưới đốm (toà nhà mới phía sau); khách tham quan (son)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "suu-tap": { ...shot([-90, 0, -100], 70, 250, 160, 1), mood: MOOD.dawn + 0.5 },
    "xay-dung": { ...shot([0, 0, 20], 80, 170, 80, -1), mood: MOOD.sunset + 0.7 },
    "thang-tram": { ...shot([0, 0, 20], 75, 190, 100, 1), mood: MOOD.sunset + 0.65 },
    "ngay-nay": { ...shot([0, 0, 20], 85, 180, 90, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
