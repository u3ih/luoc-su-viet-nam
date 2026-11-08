import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH, HO_TAY } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh thành (KINH), Hồ Tây (HO_TAY); Đông Cứu (DONG_CUU) đông; Thao Giang (THAO_GIANG) tây; NAM_QUAN hướng bắc.
// Hoạt cảnh trong từng phân cảnh: đốm ngà nhỏ (cậu bé) sáng trong làng Đông Cứu; trẻ (son) tụ về lớp học; theo thanh kéo, sĩ tử (son) từ nhiều hướng về kinh thành dự thi; cuối cùng một đốm vàng (người đỗ đầu) sáng giữa hoàng thành; đốm ngà đi lên phía bắc bàn việc cương giới, rồi trở về; đốm vàng (chức Thái sư) sáng ở kinh; sương mù (đốm xanh nhạt) phủ mặt hồ; chấm sáng (thuyền vua) giữa hồ; về sau đốm ngà rời kinh đi về phía tây (Thao Giang)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "than-dong": { ...shot([200, 0, 60], 0, 230, 110, 1), mood: MOOD.day },
    "khoa-thi": { ...shot([KINH[0], 0, KINH[1]], 80, 220, 110, -1), mood: MOOD.dawn + 0.5 },
    "ban-cuong-gioi": { ...shot([50, 0, 200], 80, 330, 180, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([HO_TAY[0], 0, HO_TAY[1]], 60, 200, 90, -1), mood: MOOD.overcast + 0.6 },
  },
};

export default config;
