import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Vịnh Mốc (VINH_MOC) giữa; sông Bến Hải nam; Cồn Cỏ (CON_CO) ngoài khơi đông.
// Hoạt cảnh trong từng phân cảnh: dọc sông Bến Hải (giới tuyến), đốm ngà; máy bay (đốm xanh nhạt) bay qua; lửa trên đồi; theo thanh kéo, dân làng (son) từ mặt đất xuống các cửa hầm; đốm ngà (đường hầm) hiện dần dưới làng; ba tầng đốm sáng (cách điệu) dưới làng; các cửa hầm (đốm vàng) mở ra biển và lên đồi; thuyền (chấm ngà) ra Cồn Cỏ; trong lòng đất, các hốc gia đình (đốm vàng nhỏ) sáng lên khi có việc; 17 đốm ngà nhỏ (17 em bé) lần lượt hiện
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "gioi-tuyen": { ...shot([80, 0, -40], 70, 260, 140, 1), mood: MOOD.overcast + 0.6 },
    "dao-ham": { ...shot([40, 0, 40], 90, 150, 60, -1), mood: MOOD.day },
    "ba-tang": { ...shot([60, 0, 40], 100, 130, 40, 1), mood: MOOD.sunset + 0.7 },
    "su-song": { ...shot([40, 0, 40], 80, 170, 70, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
