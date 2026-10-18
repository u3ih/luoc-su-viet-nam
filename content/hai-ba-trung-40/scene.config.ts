import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ: Mê Linh quanh gốc, sông Hồng phía nam (z ≈ -130), núi Ba Vì phía tây (x ≈ -300). Xem terrain.ts.
// lit: lửa khởi nghĩa (0 = tắt, 1 = cháy khắp các điểm; người xem kéo ở phân cảnh "huong-ung").
// Mood chỉ đi qua các mood kề nhau để trời không chớp tối/sáng khi cuộn.
// Hoạt cảnh trong từng phân cảnh (đoàn người, đốm sáng…) chạy theo đồng hồ phân cảnh — xem scene.ts, vị trí ở places.ts.
// Khung hình: chữ phân cảnh chẵn nằm bên phải, lẻ bên trái → máy quay đặt chủ thể hoạt cảnh ở nửa màn hình còn lại.
// "hy-sinh": lit giữ 0,55 ở keyframe; scene.ts tắt dần theo thời gian người xem dừng đọc (lửa tắt từ xa về Mê Linh).

const config: SceneConfig = {
  params: { lit: 0 },
  keyframes: {
    "mo-dau": { cam: [80, 46, -250], look: [-220, 50, 70], mood: MOOD.dawn },
    "nha-han": { cam: [150, 160, -262], look: [20, 0, 200], focus: [-60, 0, 60], mood: MOOD.overcast },
    "me-linh": { cam: [220, 30, -90], look: [20, 0, -30], focus: [40, 0, 0], mood: MOOD.dawn + 0.5 },
    "khoi-nghia": { cam: [-160, 55, -40], look: [150, 0, -35], focus: [100, 0, 20], mood: MOOD.sunset, params: { lit: 0.06 } },
    "huong-ung": { cam: [70, 120, -240], look: [-110, 0, 90], mood: MOOD.night },
    "trung-vuong": { cam: [-100, 55, -155], look: [40, 0, -30], focus: [0, 0, 20], mood: MOOD.sunset + 0.5, params: { lit: 1 } },
    "ma-vien": { cam: [320, 50, -170], look: [40, 0, -80], focus: [60, 0, -10], mood: MOOD.overcast + 0.2, params: { lit: 0.55 } },
    "hy-sinh": { cam: [-211, 52, -253], look: [-87, 0, -38], focus: [-200, 0, -80], mood: MOOD.sunset + 0.2, params: { lit: 0.55 } },
    "den-tho": { cam: [-319, 60, -135], look: [-115, 0, -15], focus: [-60, 0, -60], mood: MOOD.dawn + 0.2, params: { lit: 0 } },
  },
};

export default config;
