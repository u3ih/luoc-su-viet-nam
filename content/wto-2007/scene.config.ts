import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Bến cảng (CANG) bờ tây; biển và các đảo (thị trường) phía đông; Geneva (GENEVA) đông bắc.
// Hoạt cảnh trong từng phân cảnh: đoàn đàm phán (chấm sáng ngà) từ bến cảng sang Geneva (đốm xanh nhạt); vòng các thành viên (đốm xanh nhạt) quanh Geneva; đốm vàng (thành viên thứ 150) nối vào vòng; theo thanh kéo, tàu hàng (chấm sáng vàng) từ bến cảng toả đi các đảo xa (thị trường, đốm ngà); nhiều tuyến hàng (chấm sáng) qua lại hai chiều giữa bến cảng và các đảo
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-300,170,-300], look: [0,0,0], mood: MOOD.dawn + 0.3 },
    "ket-nap": { ...shot([60, 0, 140], 50, 330, 200, 1), mood: MOOD.dawn + 0.5 },
    "thanh-vien": { ...shot([200, 0, 230], 60, 230, 140, -1), mood: MOOD.sunset + 0.55 },
    "xuat-khau": { ...shot([60, 0, 0], 80, 340, 230, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([40, 0, 0], 85, 330, 210, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
