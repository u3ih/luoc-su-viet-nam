import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH, THE_MIEU } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Hương phía nam Kinh thành; Kinh thành (KINH), Thế Miếu (THE_MIEU), núi Ngự Bình (NGU_BINH) bên kia sông, Kim Long (KIM_LONG) phía tây.
// Hoạt cảnh trong từng phân cảnh: đốm vàng sáng ở Kim Long rồi ở Phú Xuân (chỗ Kinh thành sau này); người (son) đi từ Kim Long sang; đốm ngà cắm mốc ở bốn góc thành, đốm vàng trên núi Ngự Bình; một toán người (son) đi khảo sát quanh khu đất; nhiều toán người (son) đi dọc các cạnh thành theo thanh kéo trong khi vòng Kinh thành rồi Hoàng thành đắp dần lên; chín đốm vàng (chín đỉnh) sáng dần thành một hàng trước Thế Miếu; người (son) đến đứng xem; vệt vàng dịu chạy quanh bốn góc thành, vài nhóm người (son) đi trong thành
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,170,-320], look: [0,0,20], mood: MOOD.dawn + 0.3 },
    "phu-xuan": { ...shot([-140, 0, -50], 70, 260, 120, 1), mood: MOOD.day },
    "chon-dat": { ...shot([-20, 0, -40], 85, 330, 160, -1), mood: MOOD.sunset + 0.4 },
    "dap-thanh": { ...shot([KINH[0], 0, KINH[1]], 60, 330, 200, 1), mood: MOOD.overcast + 0.4 },
    "cuu-dinh": { ...shot([THE_MIEU[0], 0, THE_MIEU[1]], 80, 150, 60, -1), mood: MOOD.sunset + 0.6 },
    "di-san": { ...shot([KINH[0], 0, KINH[1]], 75, 360, 190, 1), mood: MOOD.sunset + 0.3 },
  },
};

export default config;
