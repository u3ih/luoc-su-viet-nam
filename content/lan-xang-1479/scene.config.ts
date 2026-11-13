import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biên giới (BIEN_GIOI_L) đông; Bồn Man (BON_MAN) giữa; Luang Prabang (LUANG_PRABANG) tây bắc.
// Hoạt cảnh trong từng phân cảnh: các toán quân nhỏ (ngà và son) giao tranh rồi rút ở miền biên giới; đốm ngà ở Bồn Man; theo thanh kéo, năm đạo quân (son) theo năm ngả từ phía đông vượt núi sang phía tây; giao tranh trên đồi (lửa); đoàn thuyền (ngà) rời kinh đô xuôi sông; đoàn quân (son) vào Luang Prabang; đoàn quân (son) rút về phía đông; đoàn người (ngà) trở lại kinh đô; một đốm vàng ở phía bắc (nhà Minh)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "bien-gioi": { ...shot([100, 0, -20], 180, 200, 110, 1), mood: MOOD.overcast + 0.6 },
    "nam-dao": { ...shot([60, 0, 0], 180, 260, 150, -1), mood: MOOD.dawn + 0.6 },
    "luang-prabang": { ...shot([-130, 0, 120], 150, 180, 100, 1), mood: MOOD.sunset + 0.65 },
    "rut-quan": { ...shot([20, 0, 20], 0, 240, 140, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
