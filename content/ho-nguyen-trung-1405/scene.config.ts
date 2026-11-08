import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { TAY_DO } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đa Bang (DA_BANG) tây bắc, Hàm Tử (HAM_TU) giữa, Tây Đô (TAY_DO) tây nam, Kỳ La (KY_LA) đông nam.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (vua) và đốm ngà (Tả Tướng quốc) ở kinh đô; triều thần (son) tụ lại; các vệt vàng dọc sông, kênh sáng dần theo thanh kéo (đê, kênh được khơi thông); thuyền lớn (ngà) xuôi sông; lửa lò rèn bật ở kinh đô; quân Minh (xanh nhạt) tràn xuống từ phía bắc qua Đa Bang; quân Đại Ngu (son) giữ thành rồi phản công ở Hàm Tử, lửa bùng; đốm ngà bị đưa từ cửa Kỳ La đi về phương bắc cùng đoàn chấm xanh nhạt; về sau các đốm vàng nhỏ (trang Nam Ông mộng lục) sáng ở phương bắc
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "ta-tuong-quoc": { ...shot([TAY_DO[0], 0, TAY_DO[1]], 250, 220, 100, 1), mood: MOOD.day },
    "than-co": { ...shot([-60, 0, 40], 60, 330, 170, -1), mood: MOOD.sunset + 0.4 },
    "chong-minh": { ...shot([-80, 0, 120], 80, 330, 170, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([100, 0, -120], 60, 330, 170, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
