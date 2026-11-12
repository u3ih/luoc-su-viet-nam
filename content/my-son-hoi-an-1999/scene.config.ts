import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Mỹ Sơn (MY_SON) tây; Hội An (HOI_AN) đông; sông Thu Bồn tây – đông; biển đông.
// Hoạt cảnh trong từng phân cảnh: một chấm ngà (Kazik) từ phương xa tới thung lũng Mỹ Sơn; các tháp (đốm xanh nhạt mờ) còn lại giữa rừng; theo thanh kéo, từng ngọn tháp (đốm vàng) được gia cố, sáng lần lượt; đoàn trùng tu (son) làm việc; những ngôi nhà gỗ phố cổ (lưới đốm ngà) sáng dọc bờ sông; người qua lại (son); cả hai nơi bừng sáng (đốm vàng lớn ở Mỹ Sơn và Hội An); vòng người (son) quanh
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "kazik": { ...shot([-170, 0, 80], 60, 230, 130, 1), mood: MOOD.dawn + 0.5 },
    "my-son": { ...shot([-170, 0, 60], 80, 170, 90, -1), mood: MOOD.sunset + 0.65 },
    "hoi-an": { ...shot([180, 0, 0], 80, 170, 80, 1), mood: MOOD.sunset + 0.7 },
    "ghi-danh": { ...shot([0, 0, 20], 80, 270, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
