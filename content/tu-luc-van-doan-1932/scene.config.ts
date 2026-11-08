import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { TOA_SOAN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Tòa soạn (TOA_SOAN), hồ (HO); sông Hồng phía đông.
// Hoạt cảnh trong từng phân cảnh: các đốm ngà (ban biên tập) tụ về tòa soạn; người (son) xếp hàng mua báo; mười đốm vàng (mười điều tôn chỉ) sáng thành vòng quanh tòa soạn; sách, báo (đốm vàng) lan từ tòa soạn ra khắp các tỉnh theo thanh kéo; những đốm sáng tự do (câu thơ mới) bay lên quanh hồ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "phong-hoa": { ...shot([TOA_SOAN[0], 0, TOA_SOAN[1]], 80, 180, 80, 1), mood: MOOD.day },
    "ton-chi": { ...shot([TOA_SOAN[0], 0, TOA_SOAN[1]], 70, 150, 60, -1), mood: MOOD.sunset + 0.6 },
    "sang-tac": { ...shot([TOA_SOAN[0], 0, TOA_SOAN[1]], 80, 360, 190, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([0, 0, 0], 80, 360, 190, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
