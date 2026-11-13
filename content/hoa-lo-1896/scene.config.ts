import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Nhà tù (HOA_LO) giữa; làng gốm (LANG_GOM) quanh; hồ Hoàn Kiếm (HO_GUOM) đông.
// Hoạt cảnh trong từng phân cảnh: các đốm ngà (lò gốm làng Hoả Lò) mờ dần; tường nhà tù đứng giữa khu phố; đốm vàng ở cổng; bốn nhóm người (son) trong bốn khu giam; bốn đốm ngà mờ; theo thanh kéo, người tù (son) thoát ra: một dòng theo đường cống ngầm phía nam, một dòng qua tường phía đông, một dòng lẫn vào người thăm nuôi qua cổng; một nhóm nhỏ (xanh nhạt) trong tường (tù binh phi công); về sau đốm vàng ở cổng (khu di tích) và đốm ngà khu phố quanh
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "maison-centrale": { ...shot([0, 0, 0], 90, 170, 90, 1), mood: MOOD.overcast + 0.6 },
    "tu-chinh-tri": { ...shot([0, 0, 0], 60, 140, 80, -1), mood: MOOD.sunset + 0.7 },
    "vuot-nguc": { ...shot([0, 0, -10], 80, 160, 80, 1), mood: MOOD.sunset + 0.85 },
    "hanoi-hilton": { ...shot([0, 0, 0], 120, 170, 90, -1), mood: MOOD.day },
  },
};

export default config;
