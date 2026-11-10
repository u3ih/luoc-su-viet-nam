import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Bãi bồi (BAI_BOI); đình Ngọc Lũ (DINH); Hà Nội (HA_NOI) bắc; khoảng trống (MAT) giữa.
// Hoạt cảnh trong từng phân cảnh: người đắp đê (son) dọc bãi bồi; đốm vàng (chiếc trống) hiện dưới cát rồi được đưa về đình làng (đốm ngà); chiếc trống (đốm vàng) rời đình làng lên Hà Nội; đốm ngà (Hà Nội) sáng lên; theo thanh kéo, mười bốn đốm vàng (ngôi sao 14 cánh) sáng giữa khoảng trống, rồi các vòng đốm ngà đồng tâm hiện dần từ trong ra ngoài — chỉ là ký hiệu, không vẽ hoa văn; sáu chấm sáng (thuyền trên tang trống) đi vòng quanh các vòng đốm, từ trái sang phải
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "tim-thay": { ...shot([-40, 0, -50], 80, 240, 120, 1), mood: MOOD.dawn + 0.5 },
    "ha-noi": { ...shot([140, 0, 150], 80, 270, 150, -1), mood: MOOD.sunset + 0.55 },
    "mat-trong": { ...shot([0, 0, 120], 85, 210, 150, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([0, 0, 120], 80, 230, 140, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
