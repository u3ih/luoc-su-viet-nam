import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (HA_NOI); Sơn Tây (SON_TAY) tây; Bắc Ninh (BAC_NINH) đông bắc; Bắc Lệ (BAC_LE), Lạng Sơn (LANG_SON) bắc.
// Hoạt cảnh trong từng phân cảnh: quân Thanh (ngà) từ biên giới xuống đóng ở Lạng Sơn, Bắc Ninh, Sơn Tây; quân Pháp (đốm xanh nhạt) giữ Hà Nội; quân Pháp (xanh nhạt) từ Hà Nội đánh Sơn Tây rồi Bắc Ninh; quân Thanh và Cờ Đen (ngà) lui lên phía bắc; theo thanh kéo, quân Pháp (xanh nhạt) bỏ Lạng Sơn rút về đồng bằng; quân Thanh (ngà) trở lại Lạng Sơn; quân Thanh (ngà) rút qua biên giới; đốm xanh nhạt sáng ở Hà Nội và Lạng Sơn (Pháp nắm Bắc Kỳ)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "quan-thanh": { ...shot([60, 0, 120], 75, 270, 150, 1), mood: MOOD.dawn + 0.5 },
    "son-tay": { ...shot([-60, 0, 20], 80, 270, 150, -1), mood: MOOD.sunset + 0.55 },
    "lang-son": { ...shot([100, 0, 160], 85, 270, 150, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([110, 0, 200], 80, 270, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
