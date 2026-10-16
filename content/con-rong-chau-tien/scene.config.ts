import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ: biển ở z âm, đồng bằng quanh gốc toạ độ, núi cao ở z dương (xem terrain.ts).
// orb: độ hiện của bọc trăm trứng; spread: trăm người con toả đi (0..1, người xem kéo ở phân cảnh "chia-con");
// village: khói bếp các làng Văn Lang; glow: độ sáng các đốm về sau.

const config: SceneConfig = {
  params: { orb: 0, spread: 0, village: 0, glow: 1 },
  keyframes: {
    "mo-dau": { cam: [-70, 42, -250], look: [0, 22, 80], mood: MOOD.dawn },
    "coi-nguon": { cam: [170, 110, -40], look: [-10, 12, 70], mood: MOOD.dawn + 0.25 },
    "lac-long-quan": { cam: [12, 10, -62], look: [-30, 6, -220], mood: MOOD.dawn + 0.5 },
    "au-co": { cam: [70, 56, 104], look: [-20, 62, 236], mood: MOOD.dawn + 0.4 },
    "boc-tram-trung": { cam: [30, 13, -8], look: [6, 9, 18], mood: MOOD.dawn + 0.15, fov: 46, params: { orb: 1 } },
    "chia-con": { cam: [50, 120, -270], look: [10, 22, 70], mood: MOOD.dawn + 0.3, fov: 56, params: { spread: 0 } },
    "van-lang": { cam: [128, 40, -18], look: [20, 4, 70], mood: MOOD.dawn + 0.6, params: { spread: 1, village: 1 } },
    "khao-co": { cam: [0, 150, -130], look: [0, 0, 60], mood: MOOD.overcast + 0.3, params: { glow: 0.6 } },
    "gio-to": { cam: [-152, 34, 30], look: [-64, 30, 100], mood: MOOD.sunset, params: { glow: 0.4 } },
  },
};

export default config;
