import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ: biển ở z âm, đồng bằng quanh gốc toạ độ, núi cao ở z dương (xem terrain.ts).
// orb: độ hiện của bọc trăm trứng; spread: trăm người con toả đi (0..1, người xem kéo ở phân cảnh "chia-con");
// village: khói bếp các làng Văn Lang; glow: độ sáng các đốm về sau.
// Hoạt cảnh trong từng phân cảnh (đốm sáng Lạc Long Quân, Âu Cơ, trứng nở, mười lăm bộ, người về Đền Hùng…) chạy theo
// đồng hồ phân cảnh — xem scene.ts. Khung hình: chữ bên phải ở phân cảnh chẵn, bên trái ở phân cảnh lẻ, nên chủ thể
// của hoạt cảnh được đặt ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: { orb: 0, spread: 0, village: 0, glow: 1 },
  keyframes: {
    "mo-dau": { cam: [-70, 42, -250], look: [0, 22, 80], mood: MOOD.dawn },
    "coi-nguon": { cam: [170, 110, -40], look: [-10, 12, 70], focus: [-80, 0, 40], mood: MOOD.dawn + 0.25 },
    "lac-long-quan": { cam: [60, 22, -160], look: [-45, 0, -30], focus: [10, 0, -50], mood: MOOD.dawn + 0.5 },
    "au-co": { cam: [140, 60, -260], look: [80, 28, 120], focus: [6, 18, 18], mood: MOOD.dawn + 0.4 },
    "boc-tram-trung": { cam: [30, 13, -8], look: [-4, 12, 8.8], focus: [6, 14, 18], mood: MOOD.dawn + 0.15, fov: 46, params: { orb: 1 } },
    "chia-con": { cam: [50, 170, -290], look: [95, 0, 30], mood: MOOD.dawn + 0.3, fov: 58, params: { spread: 0 } },
    "van-lang": { cam: [10, 170, 270], look: [10, 0, 30], focus: [-50, 20, 48], mood: MOOD.dawn + 0.6, params: { spread: 1, village: 1 } },
    "khao-co": { cam: [0, 150, -130], look: [0, -10, 30], focus: [-80, 8, 10], mood: MOOD.overcast + 0.3, params: { glow: 0.6 } },
    "gio-to": { cam: [-30, 80, -150], look: [-150, 20, 120], focus: [-64, 40, 96], mood: MOOD.sunset, params: { glow: 0.4 } },
  },
};

export default config;
