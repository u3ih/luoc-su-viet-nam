import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (HA_NOI_E), Hải Phòng (HAI_PHONG_E) bắc; Sài Gòn (SAI_GON_E) nam; Fontainebleau (FONTAINEBLEAU) ký hiệu.
// Hoạt cảnh trong từng phân cảnh: quân Trung Hoa (ngà) từ phía bắc vào Hà Nội; quân Anh, Pháp (xanh nhạt) từ biển vào Sài Gòn; theo thanh kéo, quân Trung Hoa (ngà) rút về phương bắc; quân Pháp (xanh nhạt) từ biển vào Hải Phòng rồi lên Hà Nội; đốm vàng (hiệp định) ở Hà Nội; đốm vàng ở Fontainebleau (ký hiệu); ở Sài Gòn bừng một đốm xanh nhạt (Nam Kỳ quốc), ở Đà Lạt một đốm khác; đốm vàng nhạt dần (bế tắc); lửa ở cảng Hải Phòng; quân Pháp (xanh nhạt) quanh cảng; ở Hà Nội các đốm son (chiến luỹ) sáng dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "hai-dao-quan": { ...shot([-30, 0, 50], 90, 260, 150, 1), mood: MOOD.overcast + 0.6 },
    "mung-6-3": { ...shot([40, 0, 90], 60, 220, 120, -1), mood: MOOD.day },
    "fontainebleau": { ...shot([30, 0, -110], 0, 180, 100, 1), mood: MOOD.sunset + 0.65 },
    "tam-uoc": { ...shot([80, 0, 70], 30, 180, 80, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
