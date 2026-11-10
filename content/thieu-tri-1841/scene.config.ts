import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Huế (HUE); Đà Nẵng (DA_NANG) đông nam; biển đông.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (vua mới) sáng ở điện Thái Hòa; các quan (chấm ngà) xếp hàng chầu; quân (son) từ phương nam xa rút về; các đốm xanh nhạt phía nam mờ dần; theo thanh kéo, năm vòng đốm vàng đồng tâm (bài thơ hồi văn) lần lượt sáng từ trong ra ngoài; hai tàu Pháp (chấm sáng xanh nhạt) vào cửa biển Đà Nẵng; lửa cháy trên năm thuyền đồng; đốm vàng ở Huế lịm dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "len-ngoi": { ...shot([-20, 0, 100], 80, 230, 130, 1), mood: MOOD.dawn + 0.5 },
    "kho-khan": { ...shot([-60, 0, -60], 80, 270, 150, -1), mood: MOOD.sunset + 0.55 },
    "tho": { ...shot([-20, 0, -40], 85, 170, 120, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([140, 0, -160], 50, 250, 140, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
