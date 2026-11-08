import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { THANH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thành Hoàng Đế (THANH) giữa; Quy Nhơn (QUY_NHON) đông nam; thành Bình Định mới (BINH_DINH_MOI).
// Hoạt cảnh trong từng phân cảnh: đốm vàng (vua Thái Đức) sáng giữa nền thành cũ; người (son) tụ về; hai đốm ngà (đôi sư tử đá còn lại của thành cũ) ở cửa; người (son) đắp thành dọc các cạnh theo thanh kéo, vòng thành dựng lên; ba đốm vàng: Quy Nhơn (Trung ương Hoàng đế) ở giữa, một ở bắc (Bắc Bình vương), một ở nam (Đông Định vương); đốm ở thành mờ dần; lửa bùng trong thành (Võ Tánh giữ rồi mất thành); về sau đốm vàng mới ở thành Bình Định mới, thành cũ lịm
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "thai-duc": { ...shot([THANH[0], 0, THANH[1]], 70, 220, 110, 1), mood: MOOD.day },
    "xay-thanh": { ...shot([THANH[0], 0, THANH[1]], 80, 230, 120, -1), mood: MOOD.overcast + 0.3 },
    "chia-ba": { ...shot([0, 0, 0], 80, 360, 190, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([60, 0, 30], 60, 280, 140, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
