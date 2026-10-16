import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ: Mê Linh quanh gốc, sông Hồng phía nam (z ≈ -130), núi Ba Vì phía tây (x ≈ -300). Xem terrain.ts.
// lit: lửa khởi nghĩa (0 = tắt, 1 = cháy khắp các điểm; người xem kéo ở phân cảnh "huong-ung").
// Mood chỉ đi qua các mood kề nhau để trời không chớp tối/sáng khi cuộn.

const config: SceneConfig = {
  params: { lit: 0 },
  keyframes: {
    "mo-dau": { cam: [80, 46, -250], look: [-220, 50, 70], mood: MOOD.dawn },
    "nha-han": { cam: [220, 160, -280], look: [0, 0, 40], mood: MOOD.overcast },
    "me-linh": { cam: [70, 20, -40], look: [-120, 26, 70], mood: MOOD.dawn + 0.5 },
    "khoi-nghia": { cam: [26, 12, -12], look: [0, 5, 20], mood: MOOD.sunset, fov: 46, params: { lit: 0.06 } },
    "huong-ung": { cam: [70, 120, -240], look: [0, 0, 90], mood: MOOD.night },
    "trung-vuong": { cam: [-100, 64, -160], look: [0, 0, 40], mood: MOOD.sunset + 0.5, params: { lit: 1 } },
    "ma-vien": { cam: [320, 50, -170], look: [40, 0, -80], mood: MOOD.overcast + 0.2, params: { lit: 0.55 } },
    "hy-sinh": { cam: [-160, 40, -190], look: [-290, 40, 50], mood: MOOD.sunset + 0.2, params: { lit: 0 } },
    "den-tho": { cam: [110, 70, -270], look: [-80, 30, 60], mood: MOOD.dawn + 0.2 },
  },
};

export default config;
