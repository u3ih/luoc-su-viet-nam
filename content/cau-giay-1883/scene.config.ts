import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thành Hà Nội (HA_NOI) đông; Cầu Giấy (CAU_GIAY); làng Hạ Yên Quyết (HA_YEN); phủ Hoài (PHU_HOAI) tây.
// Hoạt cảnh trong từng phân cảnh: tàu, quân Pháp (xanh nhạt) theo sông Hồng vào thành Hà Nội; quân Cờ Đen (son) tụ ở phía tây; yết thị (đốm ngà) trong thành; tàu tiếp viện (chấm sáng xanh nhạt) tới; quân Cờ Đen và quân triều Nguyễn (son) phục ở làng Hạ Yên Quyết; theo thanh kéo, quân Pháp (xanh nhạt) ra khỏi thành tới Cầu Giấy; quân phục kích (son) từ làng và cánh nam khép vòng hai bên; quân Pháp (xanh nhạt) rút về thành, một số ngã lại ở Cầu Giấy; thành Hà Nội cố thủ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "bac-ky": { ...shot([150, 0, 30], 80, 270, 150, 1), mood: MOOD.dawn + 0.5 },
    "khieu-chien": { ...shot([40, 0, 40], 85, 270, 150, -1), mood: MOOD.sunset + 0.55 },
    "phuc-kich": { ...shot([-40, 0, 50], 80, 230, 120, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([60, 0, 30], 85, 270, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
