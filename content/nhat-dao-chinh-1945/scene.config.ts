import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (HA_NOI_D), Lạng Sơn (LANG_SON_D) bắc; Huế (HUE_D) giữa; Ba Tơ (BA_TO) nam.
// Hoạt cảnh trong từng phân cảnh: theo thanh kéo, quân Nhật (xanh nhạt) cùng lúc đánh vào các đồn Pháp (đốm ngà) khắp sơ đồ; đồn tắt dần, lửa ở Lạng Sơn; đoàn biểu tình (son) từ sân trại giam kéo tới vây đồn Ba Tơ; đốm ngà ở đồn tắt, đốm vàng sáng; đốm vàng ở kinh đô Huế; một dòng người nhỏ (ngà) chở gạo từ nam ra bắc chậm chạp; các làng phía bắc (đốm ngà) mờ dần (nạn đói); đốm vàng ở Huế mờ đi; các đốm son lần lượt sáng ở Hà Nội, Huế và nhiều nơi khác
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "dem-9-3": { ...shot([0, 0, 50], 90, 260, 150, 1), mood: MOOD.sunset + 0.8 },
    "ba-to": { ...shot([30, 0, -140], 80, 170, 90, -1), mood: MOOD.dawn + 0.6 },
    "de-quoc": { ...shot([0, 0, 0], 100, 230, 120, 1), mood: MOOD.overcast + 0.6 },
    "thoai-vi": { ...shot([20, 0, -10], 80, 170, 80, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
