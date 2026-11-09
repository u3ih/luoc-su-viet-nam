import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { GIAO_CHI, CHUA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Giao Chỉ (GIAO_CHI) bên sông; biển phía đông; Kiến Nghiệp (KIEN_NGHIEP) hướng đông bắc.
// Hoạt cảnh trong từng phân cảnh: thuyền buôn (xanh nhạt) từ biển ngược sông vào Giao Chỉ; người (son) họp chợ bên bến; theo thanh kéo, đốm ngà (Tăng Hội) vào chùa; những bản kinh (đốm vàng nhỏ) lần lượt sáng quanh chùa; thuyền (đốm vàng) xuôi sông ra biển, đi về phía đông bắc tới Kiến Nghiệp (đốm vàng xa); vòng chấm ngà (người tu thiền) ngồi quanh đốm vàng ở chùa; cột sáng nhỏ (hơi thở) lên xuống
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "giao-chi": { ...shot([GIAO_CHI[0], 0, GIAO_CHI[1]], 70, 240, 100, 1), mood: MOOD.dawn + 0.5 },
    "xuat-gia": { ...shot([CHUA[0], 0, CHUA[1]], 80, 160, 70, -1), mood: MOOD.sunset + 0.6 },
    "kien-nghiep": { ...shot([200, 0, 100], 60, 320, 160, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([CHUA[0], 0, CHUA[1]], 80, 180, 75, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
