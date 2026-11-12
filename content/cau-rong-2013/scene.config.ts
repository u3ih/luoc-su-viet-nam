import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Hàn bắc – nam; bờ tây (BO_TAY); bờ đông (BO_DONG); biển phía đông.
// Hoạt cảnh trong từng phân cảnh: 17 phương án (đốm xanh nhạt) xếp hàng; một đốm vàng (phương án hình rồng) được chọn, các đốm khác tắt; theo thanh kéo, thân rồng (chuỗi đốm vàng uốn lượn lên xuống) vươn từng nhịp từ bờ đông sang bờ tây; xe (chấm ngà) chạy qua cầu từ sân bay phía tây ra biển phía đông; đầu rồng phun lửa (đốm cam, lửa) rồi phun nước (đốm xanh nhạt); người xem (son) hai bên bờ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "cuoc-thi": { ...shot([0, 0, 0], 80, 220, 120, 1), mood: MOOD.dawn + 0.5 },
    "khoi-cong": { ...shot([0, 0, 0], 75, 140, 50, -1), mood: MOOD.sunset + 0.85 },
    "thong-xe": { ...shot([0, 0, 0], 60, 160, 60, 1), mood: MOOD.sunset + 0.85 },
    "phun-lua": { ...shot([-30, 0, 0], 85, 150, 50, -1), mood: MOOD.sunset + 0.9 },
  },
};

export default config;
