import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sài Gòn (SAI_GON) giữa; Bà Rịa (BA_RIA) đông; Penang (PENANG) tây nam; khoảng trống (MAT) bắc.
// Hoạt cảnh trong từng phân cảnh: đốm vàng nhỏ (cậu bé) ở Bà Rịa; chấm ngà đi du học xa rồi trở về Sài Gòn làm việc; những đốm ngà (sách viết bằng chữ quốc ngữ) lần lượt sáng quanh Sài Gòn; một đốm xanh nhạt (điều trần gửi ra Huế) đi lên phía bắc rồi tắt; theo thanh kéo, lưới đốm vàng (các mục từ) hiện dần thành hai khối (hai tập tự vị); hai tập sách (đốm vàng) sáng; người đọc (son) qua nhiều thế hệ tụ về
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "paulus-cua": { ...shot([40, 0, -60], 70, 270, 150, 1), mood: MOOD.dawn + 0.5 },
    "quoc-ngu": { ...shot([-20, 0, 60], 80, 220, 120, -1), mood: MOOD.sunset + 0.6 },
    "tu-vi": { ...shot([60, 0, 140], 85, 180, 100, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([20, 0, 80], 80, 240, 130, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
