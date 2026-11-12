import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thăng Long (THANG_LONG) bắc; Phú Xuân (PHU_XUAN) giữa; Quy Nhơn (QUY_NHON) nam; biển phía đông.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (vua nhỏ tuổi) sáng ở Phú Xuân giữa vòng triều thần (ngà); sứ nhà Thanh (chấm xanh nhạt) từ phương bắc tới; hai toán quân (son và ngà) đóng hai bờ sông Hương đối mặt; ở phía nam, đốm Quy Nhơn lụi dần; theo thanh kéo, đoàn thuyền chúa Nguyễn (chấm xanh nhạt) từ Thị Nại theo gió nam ra bắc tới cửa Tư Dung; đốm vàng Phú Xuân lụi; quân Nguyễn (xanh nhạt) tiến ra bắc; toán nhỏ của vua Cảnh Thịnh (ngà) rời Thăng Long chạy lên phía bắc rồi dừng lại
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "len-ngoi": { ...shot([10, 0, 140], 80, 220, 120, 1), mood: MOOD.dawn + 0.5 },
    "chia-re": { ...shot([0, 0, 60], 85, 260, 150, -1), mood: MOOD.sunset + 0.55 },
    "mat-phu-xuan": { ...shot([100, 0, -40], 80, 270, 160, 1), mood: MOOD.sunset + 0.65 },
    "ket-cuc": { ...shot([-40, 0, 190], 75, 260, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
