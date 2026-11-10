import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kourou (KOUROU) đông; Quế Dương (QUE_DUONG), Bình Dương (BINH_DUONG) tây.
// Hoạt cảnh trong từng phân cảnh: vòng đốm xanh nhạt (các quốc gia, vùng lãnh thổ cùng đàm phán vị trí quỹ đạo) sáng lần lượt; một đốm vàng (vị trí 132 độ Đông) trên cao; hai trạm mặt đất (đốm vàng) sáng ở Quế Dương và Bình Dương; kỹ sư (son) tụ về; theo thanh kéo, cột đốm vàng (tên lửa) bay lên từ bãi phóng Kourou; vệ tinh (đốm vàng trên cao) đứng yên; các chuỗi đốm (đường truyền) nối xuống, các nơi (đốm ngà) sáng lên
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "chuan-bi": { ...shot([0, 0, 40], 80, 270, 160, 1), mood: MOOD.dawn + 0.5 },
    "tram": { ...shot([-130, 0, -20], 80, 250, 140, -1), mood: MOOD.sunset + 0.55 },
    "phong": { ...shot([150, 0, -40], 80, 230, 30, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([-40, 0, 0], 75, 270, 120, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
