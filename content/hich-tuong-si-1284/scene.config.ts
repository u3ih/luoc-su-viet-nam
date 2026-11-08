import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { VAN_KIEP, HAI_DUONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Chi Lăng (CHI_LANG) bắc, Vạn Kiếp (VAN_KIEP) giữa, Hải Dương (HAI_DUONG) đông nam, kinh đô (KINH) tây nam.
// Hoạt cảnh trong từng phân cảnh: quân Nguyên (xanh nhạt) tràn qua ải Chi Lăng; quân Trần (son) lui về Vạn Kiếp; đốm vàng (vua) ở Hải Dương; đốm ngà (Hưng Đạo vương) đi từ Vạn Kiếp đến gặp rồi trở về; các đạo quân (son) từ khắp các lộ tụ về Vạn Kiếp theo thanh kéo; đốm ngà ở giữa, lửa trại bật dần; các đốm vàng nhỏ (những dòng hịch được chép lại) sáng dần quanh Vạn Kiếp
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "chi-lang": { ...shot([60, 0, 200], 90, 280, 150, 1), mood: MOOD.overcast + 0.4 },
    "tau-vua": { ...shot([HAI_DUONG[0], 0, HAI_DUONG[1]], 60, 220, 100, -1), mood: MOOD.sunset + 0.5 },
    "van-kiep": { ...shot([VAN_KIEP[0], 0, VAN_KIEP[1]], 70, 280, 140, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([VAN_KIEP[0], 0, VAN_KIEP[1]], 100, 220, 100, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
