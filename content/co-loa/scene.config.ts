import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ: tâm thành Cổ Loa ở gốc, sông Hoàng phía đông (x ≈ 320), đồi thấp phía bắc (z dương). Xem terrain.ts.
// built: mức đắp thành 0..1 (người xem kéo ở phân cảnh "dap-thanh"); village: khói bếp trong thành;
// dusk: trời chiều u buồn khi mất nước.

const config: SceneConfig = {
  params: { built: 0, village: 0 },
  keyframes: {
    "mo-dau": { cam: [-270, 150, -330], look: [10, 0, 20], mood: MOOD.dawn },
    "au-lac": { cam: [330, 70, -150], look: [80, 6, 120], mood: MOOD.dawn + 0.3 },
    "dap-thanh": { cam: [-150, 75, -340], look: [-10, 0, -110], mood: MOOD.dawn + 0.5, params: { built: 0 } },
    "ba-vong-thanh": { cam: [-170, 62, -170], look: [20, 0, 40], mood: MOOD.dawn + 0.8, params: { built: 1, village: 1 } },
    "no-than": { cam: [70, 16, -40], look: [14, 6, 30], mood: MOOD.overcast, fov: 46 },
    "my-chau": { cam: [110, 46, 60], look: [14, 3, 34], mood: MOOD.overcast + 0.4 },
    "mat-nuoc": { cam: [-230, 90, 230], look: [10, 0, 10], mood: MOOD.sunset + 0.4 },
    "bac-thuoc": { cam: [0, 280, -260], look: [10, 0, 20], mood: MOOD.night, params: { village: 0 } },
    "hom-nay": { cam: [240, 120, -240], look: [10, 0, 20], mood: MOOD.day, params: { village: 1 } },
  },
};

export default config;
