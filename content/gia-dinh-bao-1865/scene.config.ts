import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { TOA_SOAN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Tòa soạn (TOA_SOAN) giữa; sông phía đông.
// Hoạt cảnh trong từng phân cảnh: đốm ngà (Trương Vĩnh Ký) từ bến sông về; đốm vàng (nghị định) sáng ở tòa soạn; theo thanh kéo, những vòng đốm vàng (số báo) lan từ tòa soạn ra các tỉnh; học trò (son) ở các trường đọc báo; hai đốm ngà (Trương Vĩnh Ký, Huỳnh Tịnh Của) ở tòa soạn; nhiều đốm vàng nhỏ (khảo cứu, thơ văn, truyện) quanh; nhiều đốm ngà (người đọc chữ Quốc ngữ) sáng dần khắp vùng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "nghi-dinh": { ...shot([TOA_SOAN[0], 0, TOA_SOAN[1]], 80, 200, 90, 1), mood: MOOD.day },
    "so-dau": { ...shot([TOA_SOAN[0], 0, TOA_SOAN[1]], 80, 340, 180, -1), mood: MOOD.sunset + 0.5 },
    "truong-vinh-ky": { ...shot([TOA_SOAN[0], 0, TOA_SOAN[1]], 70, 180, 80, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([0, 0, 0], 80, 360, 190, -1), mood: MOOD.sunset + 0.55 },
  },
};

export default config;
