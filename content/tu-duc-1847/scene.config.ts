import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh thành (KINH_THANH) bắc; Khiêm Lăng (KHIEM_LANG) nam sông; Nam Kỳ (NAM_KY_T) nam.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (điện Thái Hoà) sáng giữa kinh thành; bá quan (ngà) đứng thành hàng trước điện; lửa nổi dậy ở xa (phía tây bắc); một nhóm (son) nổi lên ngay ở kinh thành rồi tan; người phu (ngà) ở công trường lăng phía nam sông; theo thanh kéo, sáu đốm ngà (sáu tỉnh Nam Kỳ) lần lượt bị phủ đốm xanh nhạt — ba tỉnh miền Đông trước, ba tỉnh miền Tây sau; tàu (xanh nhạt) từ biển vào; các bản điều trần (đốm ngà nhỏ) từ nhiều nơi đưa về kinh thành; đốm vàng ở điện mờ dần; đốm vàng nhỏ sáng ở Khiêm Lăng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "len-ngoi": { ...shot([0, 0, 70], 90, 170, 80, 1), mood: MOOD.dawn + 0.5 },
    "hong-bao": { ...shot([0, 0, 10], 60, 220, 120, -1), mood: MOOD.overcast + 0.6 },
    "mat-dat": { ...shot([0, 0, -150], 90, 200, 120, 1), mood: MOOD.sunset + 0.65 },
    "cai-cach": { ...shot([20, 0, 20], 110, 200, 100, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
