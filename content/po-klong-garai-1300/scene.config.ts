import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { DOI_TRAU, TANG_DA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đồi Trầu (DOI_TRAU) giữa đồng; tảng đá (TANG_DA) tây; biển đông.
// Hoạt cảnh trong từng phân cảnh: một chấm (Jatol) nghỉ bên tảng đá; hai đốm trắng (hai con rồng trắng — truyền thuyết) lượn quanh rồi biến mất; theo thanh kéo, ba cột đốm vàng (tháp chính cao, tháp lửa, tháp cổng thấp hơn) mọc lên trên đồi Trầu; đốm vàng dịu (tượng thờ vua) sáng trong lòng tháp chính; đốm ngà (bia) bên cạnh; người (son) từ các làng xa lên đồi hành lễ; ba đốm vàng (ba tháp) sáng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "truyen-thuyet": { ...shot([TANG_DA[0], 0, TANG_DA[1]], 80, 160, 60, 1), mood: MOOD.sunset + 0.6 },
    "dung-thap": { ...shot([DOI_TRAU[0], 0, DOI_TRAU[1]], 80, 170, 70, -1), mood: MOOD.sunset + 0.5 },
    "tuong-vua": { ...shot([DOI_TRAU[0], 0, DOI_TRAU[1]], 90, 110, 45, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([DOI_TRAU[0], 0, DOI_TRAU[1]], 70, 220, 90, -1), mood: MOOD.dawn + 0.5 },
  },
};

export default config;
