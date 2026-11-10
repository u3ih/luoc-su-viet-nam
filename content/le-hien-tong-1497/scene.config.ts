import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh thành (CUNG) bắc; các xã nam; đê ven sông phía đông.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (vua mới) sáng giữa kinh thành; các quan (chấm ngà) vào chầu; sứ (chấm ngà) đi khắp các xã; người (son) từ trong núi trở về làng làm ăn; theo thanh kéo, đê ven sông (chuỗi đốm ngà) đắp dần; ngòi lạch (chuỗi đốm vàng) khơi ra đồng; dân (son) ra đắp đê; đốm vàng ở kinh thành lịm dần (vua mất năm 1504)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "thai-tu": { ...shot([20, 0, 190], 80, 220, 120, 1), mood: MOOD.dawn + 0.5 },
    "on-hoa": { ...shot([0, 0, 60], 80, 270, 150, -1), mood: MOOD.sunset + 0.55 },
    "nong-tang": { ...shot([80, 0, -40], 70, 260, 150, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([20, 0, 190], 80, 240, 130, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
