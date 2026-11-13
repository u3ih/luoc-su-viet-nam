import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Quảng Nguyên (QUANG_NGUYEN) tây nam; Ung Châu (UNG_CHAU) bắc; Quảng Châu (QUANG_CHAU_N) đông; Thăng Long (THANG_LONG_N) nam.
// Hoạt cảnh trong từng phân cảnh: đốm vàng nhỏ (mỏ vàng, bạc) quanh châu Quảng Nguyên; hai đốm ở xa (Thăng Long phía nam, Ung Châu phía bắc); đoàn người (son) dựng nước ở Quảng Nguyên; quân Lý (ngà) từ Thăng Long lên đưa Trí Cao về rồi trả lại; theo thanh kéo, đoàn quân (son) từ Ung Châu tiến xuống phía đông, vây Quảng Châu (đốm ngà); đoàn quân Tống (xanh nhạt) từ phía bắc xuống; đoàn quân (son) tan, chạy về phía tây; đốm vàng (đền thờ) sáng ở Cao Bằng về sau
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "quang-nguyen": { ...shot([-110, 0, -60], 80, 180, 100, 1), mood: MOOD.dawn + 0.5 },
    "dai-lich": { ...shot([-80, 0, -100], 100, 200, 110, -1), mood: MOOD.overcast + 0.6 },
    "quang-chau": { ...shot([60, 0, 90], 30, 230, 130, 1), mood: MOOD.sunset + 0.65 },
    "dich-thanh": { ...shot([0, 0, 40], 110, 240, 140, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
