import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh thành (KINH) bờ bắc sông Hương; bến Thương Bạc (THUONG_BAC); Hà Trung (HA_TRUNG) đông; QUANG_NGAI hướng nam.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (ngai vua) sáng giữa Hoàng thành; quân Pháp (xanh nhạt) đứng quanh; các đốm ngà (hội viên Quang phục Hội) sáng dần ở nhiều nơi; một chấm xanh nhạt (tin bị lộ) chạy từ phía nam ra kinh đô; trong đêm, một chấm ngà (thuyền đón vua) rời bến Thương Bạc xuôi sông về làng Hà Trung theo thanh kéo; quân Pháp (xanh nhạt) vây làng Hà Trung; một chấm ngà rời đi ra biển xa; về sau đốm vàng sáng lại ở Huế (thi hài vua được đưa về năm 1987)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,170,-320], look: [0,0,20], mood: MOOD.dawn + 0.3 },
    "len-ngoi": { ...shot([KINH[0], 0, KINH[1]], 70, 260, 140, 1), mood: MOOD.day },
    "hen-gio": { ...shot([60, 0, -100], 60, 280, 150, -1), mood: MOOD.sunset + 0.4 },
    "dem-thang-5": { ...shot([170, 0, -40], 70, 280, 130, 1), mood: MOOD.sunset + 0.85 },
    "ve-sau": { ...shot([220, 0, 40], 60, 320, 160, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
