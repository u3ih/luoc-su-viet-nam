import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { OC_EO } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Núi Ba Thê (BA_THE); gò Óc Eo (OC_EO); kênh rạch; biển tây nam.
// Hoạt cảnh trong từng phân cảnh: vài chấm ngà (người khảo cổ) đến gò đất; các đốm vàng nhỏ (di vật) lộ ra trên gò; thuyền (chấm ngà) đi lại trên kênh rạch; người (son) làm ruộng hai bên kênh; theo thanh kéo, đoàn thuyền buôn (chấm vàng và xanh nhạt) từ biển xa nhiều hướng vào kênh, tụ về gò Óc Eo; các đốm vàng (đền thờ thần) sáng trên những gò cao quanh Óc Eo và chân núi Ba Thê
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "go-oc-eo": { ...shot([OC_EO[0], 0, OC_EO[1]], 60, 220, 110, 1), mood: MOOD.day },
    "nha-san": { ...shot([60, 0, -40], 80, 220, 100, -1), mood: MOOD.dawn + 0.5 },
    "cang-thi": { ...shot([-80, 0, -80], 230, 300, 160, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([OC_EO[0], 0, OC_EO[1]], 70, 220, 110, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
