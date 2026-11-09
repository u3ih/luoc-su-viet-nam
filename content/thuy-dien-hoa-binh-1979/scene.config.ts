import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Đà ngang cảnh, chảy về phía đông; đập (DAP) ở giữa; đài tưởng niệm (TUONG_NIEM) hạ lưu.
// Hoạt cảnh trong từng phân cảnh: công nhân, chuyên gia (son, ngà) tụ về hai bờ sông Đà; mũi khoan thăm dò (đốm ngà); theo thanh kéo, con đập (khối tường) khép dần dòng sông; công nhân (son) trên đập; tám tổ máy (đốm vàng) lần lượt sáng; điện (chuỗi đốm vàng) toả về phía đông; đài tưởng niệm (đốm ngà) bên hạ lưu; người đến viếng (son)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,170,-280], look: [0,0,0], mood: MOOD.dawn + 0.3 },
    "khoi-cong": { ...shot([0, 0, 0], 80, 230, 120, 1), mood: MOOD.dawn + 0.5 },
    "ngan-song": { ...shot([0, 0, 0], 30, 200, 110, -1), mood: MOOD.sunset + 0.55 },
    "phat-dien": { ...shot([40, 0, 0], 20, 260, 130, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([80, 0, -40], 160, 220, 100, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
