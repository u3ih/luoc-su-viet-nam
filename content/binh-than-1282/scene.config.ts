import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hợp lưu Bình Than (BINH_THAN); Trần Xá (TRAN_XA) bờ đông; thái ấp (THAI_AP) phía tây.
// Hoạt cảnh trong từng phân cảnh: thuyền vua (đốm vàng) theo sông về bến Bình Than; vương hầu, trăm quan (ngà) tụ ở Trần Xá; một thuyền than (đốm ngà) xuôi sông Kinh Thầy tới bến; được mời vào nơi họp; theo thanh kéo, gia nô và thân thuộc (son) từ các làng tụ về thái ấp của Quốc Toản; cuối cùng đốm vàng (lá cờ sáu chữ) sáng lên; đội quân của Quốc Toản (son) xuống thuyền xuôi sông ra trận; quân Nguyên (xanh nhạt) từ phía bắc
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "hop-ban": { ...shot([100, 0, 20], 80, 220, 100, 1), mood: MOOD.dawn + 0.5 },
    "khanh-du": { ...shot([120, 0, 90], 70, 200, 80, -1), mood: MOOD.sunset + 0.55 },
    "qua-cam": { ...shot([-240, 0, 40], 80, 210, 100, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([-60, 0, 0], 80, 320, 170, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
