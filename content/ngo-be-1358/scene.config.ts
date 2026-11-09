import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Núi Yên Phụ (YEN_PHU) giữa; các làng; kinh thành (KINH) tây nam.
// Hoạt cảnh trong từng phân cảnh: dân phiêu tán (son) tụ về chân núi Yên Phụ; quân triều (xanh nhạt) tới, nhóm son tản ra nhiều ngả; theo thanh kéo, dân nghèo (son) các làng tụ về chân núi; đốm vàng (bảng 'chẩn cứu dân nghèo') sáng lên; nhà giàu các làng bỏ thóc cứu đói (đốm ngà); quân triều (xanh nhạt) từ kinh thành kéo tới; nghĩa quân (son) tan vỡ; đốm vàng ở chân núi lịm dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "yen-phu": { ...shot([-50, 0, 60], 80, 260, 120, 1), mood: MOOD.dawn + 0.5 },
    "chan-cuu": { ...shot([-50, 0, 30], 80, 280, 140, -1), mood: MOOD.sunset + 0.55 },
    "trieu-dinh": { ...shot([-100, 0, -20], 70, 300, 170, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([-40, 0, 40], 80, 230, 110, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
