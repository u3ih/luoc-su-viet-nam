import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đồi Khau Cả (KHAU_CA) giữa; suối Nậm La; đường núi (DUONG_NUI) đông.
// Hoạt cảnh trong từng phân cảnh: tường nhà tù trên đỉnh đồi; đốm vàng nhỏ (tháp canh) ở hai góc; suối dưới chân đồi; theo thanh kéo, đoàn tù (son) có lính áp giải (xanh nhạt) đi theo đường núi từ phía đông lên đỉnh đồi; những người tù (son) ngồi thành vòng trong sân (học tập); một đốm hồng (cây đào) sáng giữa sân; lửa (bom) phá tường; về sau đốm vàng (khu di tích) sáng; dòng khách (ngà) lên đồi
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "khau-ca": { ...shot([0, 0, 0], 90, 180, 100, 1), mood: MOOD.overcast + 0.6 },
    "doan-tu": { ...shot([80, 0, -10], 160, 200, 110, -1), mood: MOOD.dawn + 0.6 },
    "to-hieu": { ...shot([0, 0, 0], 60, 130, 70, 1), mood: MOOD.sunset + 0.7 },
    "di-tich": { ...shot([0, 0, 0], 120, 180, 100, -1), mood: MOOD.day },
  },
};

export default config;
