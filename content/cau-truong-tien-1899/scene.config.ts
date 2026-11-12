import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Hương tây – đông; bờ bắc (BAC); bờ nam (NAM).
// Hoạt cảnh trong từng phân cảnh: chuỗi đốm ngà mờ (cầu Mây, cầu Mống) vắt qua sông; người (son) qua lại; theo thanh kéo, bảy trụ (đốm vàng) lần lượt sáng nối hai bờ thành sáu nhịp; thợ (son) đứng hai đầu cầu; dòng lũ (chấm xanh nhạt) cuốn qua; bốn nhịp giữa tắt rồi sáng lại khi cầu được làm lại; cầu sáng đèn đổi màu (đốm vàng và ngà xen nhau); người qua cầu hai chiều
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "cau-mong": { ...shot([0, 0, 0], 60, 200, 80, 1), mood: MOOD.dawn + 0.5 },
    "xay-cau": { ...shot([0, 0, 0], 70, 190, 70, -1), mood: MOOD.sunset + 0.6 },
    "lu-nam-thin": { ...shot([0, 0, 0], 30, 220, 90, 1), mood: MOOD.sunset + 0.55 },
    "ve-sau": { ...shot([0, 0, 0], 75, 190, 60, -1), mood: MOOD.sunset + 0.75 },
  },
};

export default config;
