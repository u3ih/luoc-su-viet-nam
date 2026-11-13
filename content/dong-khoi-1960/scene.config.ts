import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Định Thuỷ (DINH_THUY), Phước Hiệp (PHUOC_HIEP), Bình Khánh (BINH_KHANH) giữa; Giồng Trôm (GIONG_TROM) bắc.
// Hoạt cảnh trong từng phân cảnh: các đồn của chính quyền (đốm xanh nhạt) khắp vùng; người (son) lặng lẽ đi giữa vườn dừa; theo thanh kéo, ba xã (đốm vàng) sáng lên, dân (son) tụ về; rồi các xã quanh (đốm ngà) sáng theo; đoàn phụ nữ (ngà) đông dần, kéo tới trước đồn (đốm xanh nhạt) ở Giồng Trôm; các vùng (đốm ngà) khắp đồng bằng sáng lên; đốm vàng lớn (Mặt trận) sáng sau cùng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "luat-10-59": { ...shot([0, 0, 0], 85, 240, 130, 1), mood: MOOD.overcast + 0.6 },
    "mo-cay": { ...shot([10, 0, -20], 90, 170, 80, -1), mood: MOOD.dawn + 0.6 },
    "toc-dai": { ...shot([0, 0, 230], 90, 170, 80, 1), mood: MOOD.day },
    "mat-tran": { ...shot([0, 0, 40], 80, 280, 160, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
