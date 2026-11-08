import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { LONG_PHUNG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển phía đông; đèo Cù Mông (CU_MONG) bắc; sông Đà Diễn nam, sông Cái bắc; Tuy Hòa (TUY_HOA), Đồng Xuân (DONG_XUAN), thành Hồ (THANH_HO), Long Phụng (LONG_PHUNG).
// Hoạt cảnh trong từng phân cảnh: một đoàn quân (son) từ phía bắc vượt đèo Cù Mông xuống sông Đà Diễn, lửa bật ở thành Hồ; ba đoàn lưu dân (son) vượt đèo vào châu thổ theo thanh kéo, các làng mới (vàng) sáng dần dọc hai bờ sông; hai đốm vàng lớn (hai huyện Đồng Xuân, Tuy Hòa) sáng lên; đốm ngà ở Long Phụng lịm dần, người (son) tụ về; các đốm vàng nhỏ (những lần truy phong) lần lượt sáng quanh đền Long Phụng; người (son) tụ về, lửa lễ bật dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [60,0,40], mood: MOOD.dawn + 0.3 },
    "vao-nam": { ...shot([100, 0, 60], 280, 330, 170, 1), mood: MOOD.overcast + 0.3 },
    "luu-dan": { ...shot([40, 0, 60], 70, 360, 180, -1), mood: MOOD.day },
    "lap-phu": { ...shot([60, 0, 80], 75, 300, 150, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([LONG_PHUNG[0], 0, LONG_PHUNG[1]], 70, 210, 100, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
