import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ: đầm Dạ Trạch quanh gốc, bãi giữa đầm ở (-20, 10), trại quân Lương trên bờ đông (x ≈ 260). Xem terrain.ts.
// camp: lửa trại giặc (0..1); raid: thuyền độc mộc đánh úp (tự diễn sau khi người xem kéo cho đêm xuống).
// Ở phân cảnh "da-trach", người xem kéo thanh để trời chuyển từ ngày sang đêm (scene.ts chỉnh mood).
// Hoạt cảnh trong từng phân cảnh (đoàn quân, lửa, ánh sáng truyền thuyết) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Máy quay đặt để chủ thể hoạt cảnh nằm ở nửa màn hình không có khối chữ (chữ bên trái ở phân cảnh lẻ, bên phải ở phân cảnh chẵn).

const config: SceneConfig = {
  params: { camp: 0.25, raid: 0 },
  keyframes: {
    "mo-dau": { cam: [-170, 30, -210], look: [0, 2, 0], mood: MOOD.dawn },
    "nha-luong": { cam: [40, 170, 300], look: [150, 0, -160], focus: [280, 0, -90], mood: MOOD.overcast },
    "khoi-nghia": { cam: [-80, 200, -60], look: [300, 0, 170], focus: [262, 0, 20], mood: MOOD.overcast + 0.6 },
    "van-xuan": { cam: [170, 50, 130], look: [260, 0, -40], focus: [280, 0, 20], mood: MOOD.sunset },
    "phan-cong": { cam: [60, 120, -240], look: [200, 0, 160], focus: [272, 0, 20], mood: MOOD.overcast + 0.4, params: { camp: 0.5 } },
    "da-trach": { cam: [-140, 22, -90], look: [200, 2, -45], focus: [-17, 2, 0], mood: MOOD.overcast },
    "long-bien": { cam: [120, 60, -140], look: [200, 0, 120], focus: [240, 0, 10], mood: MOOD.night + 0.65, params: { camp: 1, raid: 1 } },
    "tu-chu": { cam: [-60, 150, -40], look: [300, 0, 60], focus: [285, 0, 40], mood: MOOD.day, params: { camp: 0 } },
    "mong-rong": { cam: [-170, 40, -110], look: [0, 22, 120], focus: [-17, 12, 0], mood: MOOD.day, params: { raid: 0 } },
  },
};

export default config;
