import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Huế (HUE_M), Đà Nẵng (DA_NANG_M) bắc; Sài Gòn (SAI_GON_M) nam; Khe Sanh (KHE_SANH_M) tây bắc.
// Hoạt cảnh trong từng phân cảnh: ba đốm ngà (Sài Gòn, Huế, Đà Nẵng) sáng — mục tiêu chính; đốm son ở Khe Sanh (hướng nghi binh) sáng trước; theo thanh kéo, đêm giao thừa, hơn một trăm đốm son lần lượt bừng lên khắp các đô thị; lửa ở vài nơi; lửa khắp Huế; dòng người (ngà) rời thành phố về phía nam; đốm vàng (kinh thành) mờ dần; các nhóm (son) rút khỏi đô thị về phía tây; đốm vàng (hoà đàm Paris, ký hiệu) sáng ngoài khơi
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "ke-hoach": { ...shot([0, 0, 10], 90, 260, 160, 1), mood: MOOD.overcast + 0.6 },
    "giao-thua": { ...shot([10, 0, -10], 100, 260, 160, -1), mood: MOOD.sunset + 0.85 },
    "hue": { ...shot([-40, 0, 140], 80, 170, 90, 1), mood: MOOD.overcast + 0.7 },
    "buoc-ngoat": { ...shot([0, 0, -10], 60, 260, 150, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
