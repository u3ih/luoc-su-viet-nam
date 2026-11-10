import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Huế (HUE) giữa; Đà Lạt (DA_LAT) nam; Thành phố Hồ Chí Minh (HCM) nam xa; Hà Nội (HA_NOI) bắc.
// Hoạt cảnh trong từng phân cảnh: văn bản tấu trình (chấm sáng ngà) từ các nơi về kinh thành; đốm vàng (nhà vua) giữa thành; theo thanh kéo, các đốm son (những nét bút phê: chấm, khuyên, gạch, sửa) lần lượt hiện lên trên văn bản (lưới đốm ngà); châu bản (chấm vàng) chuyển từ Huế lên Đà Lạt, xuống Thành phố Hồ Chí Minh, rồi ra Hà Nội; đốm vàng ở Hà Nội (nơi lưu giữ hiện nay) sáng; vòng đốm ngà quanh (Ký ức Thế giới)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "van-ban": { ...shot([0, 0, 80], 80, 200, 110, 1), mood: MOOD.dawn + 0.5 },
    "but-son": { ...shot([0, 0, 60], 85, 150, 90, -1), mood: MOOD.sunset + 0.7 },
    "luu-tru": { ...shot([-40, 0, -60], 80, 270, 180, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([-60, 0, 200], 80, 250, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
