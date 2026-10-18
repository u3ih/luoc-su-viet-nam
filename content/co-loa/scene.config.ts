import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ: tâm thành Cổ Loa ở gốc, sông Hoàng phía đông (x ≈ 320), đồi thấp phía bắc (z dương). Xem terrain.ts.
// built: mức đắp thành 0..1 (người xem kéo ở phân cảnh "dap-thanh"); village: khói bếp trong thành;
// wear: độ mòn của thành (1 = chỉ còn từng đoạn, như ngày nay).
// Hoạt cảnh trong từng phân cảnh (đoàn người, phát nỏ, đuốc…) chạy theo đồng hồ phân cảnh — xem scene.ts.

const config: SceneConfig = {
  params: { built: 0, village: 0, wear: 0 },
  keyframes: {
    "mo-dau": { cam: [-270, 150, -330], look: [10, 0, 20], mood: MOOD.dawn },
    "au-lac": { cam: [300, 150, -210], look: [26, 0, 121], focus: [0, 0, 16], mood: MOOD.dawn + 0.3 },
    "dap-thanh": { cam: [-150, 75, -340], look: [-10, 0, -110], mood: MOOD.dawn + 0.5, params: { built: 0 } },
    "ba-vong-thanh": { cam: [-170, 62, -170], look: [20, 0, 40], mood: MOOD.dawn + 0.8, params: { built: 1, village: 1 } },
    "no-than": { cam: [200, 30, 108], look: [243, 2, 254], focus: [262, 2, 215], mood: MOOD.overcast, fov: 46 },
    "my-chau": { cam: [190, 120, -120], look: [105, 0, 199], focus: [24, 0, 120], mood: MOOD.overcast + 0.4 },
    "mat-nuoc": { cam: [-60, 190, -540], look: [-200, 0, 60], focus: [-10, 0, -60], mood: MOOD.sunset + 0.4 },
    "bac-thuoc": { cam: [0, 280, -260], look: [10, 0, 20], mood: MOOD.night, params: { village: 0 } },
    "hom-nay": { cam: [240, 120, -240], look: [10, 0, 20], mood: MOOD.day, params: { village: 1, wear: 1 } },
  },
};

export default config;
