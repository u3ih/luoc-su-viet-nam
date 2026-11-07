import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { THANG_LONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông; Thăng Long (THANG_LONG) bắc, Bố Chính (BO_CHINH), châu Ô (O_CHAU), châu Lý (LY_CHAU) giữa, Chiêm Thành (CHIEM) nam. Khoảng cách thu ngắn rất nhiều.
// Hoạt cảnh trong từng phân cảnh: một đốm ngà cùng vài người (son) đi từ Bố Chính về phương nam tới Chiêm Thành, đốm vàng sáng ở Chiêm Thành; các nhóm sứ (xanh nhạt) từ phương nam đi lên Thăng Long; người (son) trong triều tụ lại, chia hai phía; đoàn đưa công chúa (đốm ngà + người son) đi từ Thăng Long về phương nam theo thanh kéo; vùng châu Ô, châu Lý sáng dần (vàng); một chấm ngà (thuyền) rời bờ Chiêm Thành ra biển rồi chậm rãi đi lên phía bắc dọc bờ; đốm vàng sáng ở Hổ Sơn và ở Ngũ Phong, các nhóm người (son) đến đứng lặng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,180,-300], look: [60,0,20], mood: MOOD.dawn + 0.3 },
    "van-du": { ...shot([120, 0, -150], 270, 300, 150, 1), mood: MOOD.day },
    "ban-cai": { ...shot([THANG_LONG[0], 0, THANG_LONG[1]], 80, 250, 120, -1), mood: MOOD.overcast + 0.4 },
    "hon-le": { ...shot([60, 0, -30], 250, 290, 160, 1), mood: MOOD.sunset + 0.4 },
    "tro-ve": { ...shot([270, 0, 0], 90, 330, 140, -1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([-60, 0, 250], 85, 260, 120, 1), mood: MOOD.sunset + 0.3 },
  },
};

export default config;
