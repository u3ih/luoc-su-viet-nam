import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Quảng Châu (QUANG_CHAU) bắc; Hương Cảng (HUONG_CANG) đông; Hà Nội (HA_NOI_C), Nghệ An (NGHE_AN), Sài Gòn (SAI_GON_C) tây và nam.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (Hội Thanh niên) sáng ở Quảng Châu; các nhóm hội viên (son) từ đó về Hà Nội, Nghệ An, Sài Gòn; ba đốm ngà (ba tổ chức cộng sản) lần lượt sáng ở Hà Nội, Sài Gòn, Nghệ An — mỗi đốm có vòng người riêng, rời nhau; theo thanh kéo, đại biểu (son) từ ba nơi trong nước tụ về Hương Cảng; đốm vàng sáng khi hợp nhất; từ Hương Cảng, các vòng đốm sáng lan dần ra cả Đông Dương (cách điệu)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "quang-chau": { ...shot([20, 0, 100], 80, 220, 120, 1), mood: MOOD.dawn + 0.5 },
    "ba-to-chuc": { ...shot([-90, 0, 0], 80, 250, 150, -1), mood: MOOD.sunset + 0.6 },
    "cuu-long": { ...shot([60, 0, 50], 30, 230, 130, 1), mood: MOOD.sunset + 0.65 },
    "dong-duong": { ...shot([-60, 0, 30], 110, 250, 150, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
