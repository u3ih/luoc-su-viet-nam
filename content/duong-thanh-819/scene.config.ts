import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Tống Bình (TONG_BINH) bên sông Hồng; đường đi Hoàng Động (HOANG_DONG) tây bắc; Tạc Khẩu (TAC_KHAU) nam.
// Hoạt cảnh trong từng phân cảnh: phủ thành Tống Bình (đốm xanh nhạt) có quân đô hộ đóng; chấm ngà (Dương Thanh) từ phía nam bị điều về thành; theo thanh kéo, đoàn quân (son) ra đi về phía Hoàng Động rồi quay lại đánh chiếm phủ thành; lửa bùng ở Tống Bình; quân Đường (xanh nhạt) kéo tới từ phía bắc; một cánh nghĩa quân (son) rút về Tạc Khẩu, lửa ở Tạc Khẩu; các nhóm nghĩa quân nhỏ (son) đi lại giữa vùng núi (theo Toàn thư, còn chống tới năm 828); thành nhỏ La Thành (đốm xanh nhạt)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "hao-truong": { ...shot([120, 0, 40], 80, 220, 100, 1), mood: MOOD.dawn + 0.5 },
    "quay-quan": { ...shot([-40, 0, 120], 70, 320, 180, -1), mood: MOOD.sunset + 0.55 },
    "that-bai": { ...shot([60, 0, -40], 80, 300, 170, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([-120, 0, 60], 80, 330, 180, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
