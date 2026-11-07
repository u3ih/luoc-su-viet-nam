import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CON_SON } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông chảy tây – đông; kinh sư (KINH_SU) tây, Lệ Chi Viên (LE_CHI) giữa, Chí Linh (CHI_LINH), Côn Sơn (CON_SON) đông bắc. Đường đi là diễn hoạ.
// Hoạt cảnh trong từng phân cảnh: đốm ngà sáng ở Côn Sơn, vài người (son) đến; đốm vàng ở kinh sư xa; đoàn ngự giá (người son, đốm vàng dẫn đầu) đi từ Côn Sơn qua Chí Linh về Lệ Chi Viên theo thanh kéo, đèn lửa bật lên ở Lệ Chi Viên; đốm vàng ở Lệ Chi Viên lịm dần; đoàn xa giá (son) lặng lẽ rời đi về kinh sư; lửa bật ở kinh sư; trời sáng, đốm vàng sáng dần ở Côn Sơn, các nhóm người (son) đến đứng lặng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,170,-300], look: [40,0,80], mood: MOOD.dawn + 0.3 },
    "con-son": { ...shot([CON_SON[0], 0, CON_SON[1]], 60, 230, 120, 1), mood: MOOD.day },
    "tuan-du": { ...shot([140, 0, 120], 80, 330, 150, -1), mood: MOOD.day },
    "ba-cach": { ...shot([-80, 0, 20], 80, 330, 140, 1), mood: MOOD.sunset + 0.7 },
    "minh-oan": { ...shot([CON_SON[0], 0, CON_SON[1]], 70, 250, 130, -1), mood: MOOD.dawn + 0.3 },
  },
};

export default config;
