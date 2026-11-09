import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đại La (DAI_LA) ở giữa; sông Hồng phía đông; sông Tô Lịch phía tây.
// Hoạt cảnh trong từng phân cảnh: quân Nam Chiếu (xanh nhạt) giữ thành; quân Đường (son) kéo tới từ phía đông; lửa bùng trong thành; theo thanh kéo, vòng thành rồi vòng đê ngoài đắp dần lên; người đắp thành (son) quanh bốn phía; truyền thuyết: cột đốm vàng (đám mây ngũ sắc, thần Long Đỗ) bốc lên rồi tan; đốm ngà (đền thờ thần) sáng lên; đoàn người (ngà) từ Hoa Lư phía nam kéo về thành (dời đô năm 1010); đốm vàng giữa thành
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "tong-binh": { ...shot([20, 0, 40], 75, 300, 160, 1), mood: MOOD.dawn + 0.5 },
    "dap-thanh": { ...shot([20, 0, 40], 65, 320, 190, -1), mood: MOOD.sunset + 0.55 },
    "long-do": { ...shot([-30, 0, 80], 80, 220, 90, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([20, 0, 20], 90, 330, 190, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
