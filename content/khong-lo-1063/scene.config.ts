import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Lại Trì (LAI_TRI), Dũng Nhuệ (DUNG_NHUE) bờ tây sông Hồng; nơi học đạo (THAY) phía tây.
// Hoạt cảnh trong từng phân cảnh: thuyền chài (chấm ngà) trên sông; làng chài (son); một chấm ngà (Không Lộ) lên bờ; chấm ngà rời làng chài sang phía tây theo thầy học đạo; nơi học (đốm vàng) sáng lên; theo thanh kéo, chùa Nghiêm Quang (cột đốm vàng) dựng lên bên sông; dân (son) tụ về; chấm ngà theo đường sông lên kinh thành phía bắc (đốm vàng); về sau tháp thờ (đốm ngà) ở chùa
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "chai-luoi": { ...shot([250, 0, -100], 80, 200, 80, 1), mood: MOOD.dawn + 0.5 },
    "hoc-dao": { ...shot([0, 0, -40], 80, 320, 160, -1), mood: MOOD.sunset + 0.55 },
    "chua-keo": { ...shot([190, 0, 70], 75, 200, 90, 1), mood: MOOD.sunset + 0.65 },
    "quoc-su": { ...shot([120, 0, 160], 70, 320, 180, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
