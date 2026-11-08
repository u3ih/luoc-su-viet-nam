import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { DE } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Hồng phía đông; kinh thành (KINH) bờ tây; con đê (DE) dọc bờ tây.
// Hoạt cảnh trong từng phân cảnh: nước lũ (đốm xanh nhạt) tràn từ sông vào đồng ruộng và phố phường bờ tây; theo thanh kéo, người (son) dàn hàng dọc bờ tây đắp đê; con đê cao dần dọc bờ sông; những hàng đốm vàng (đê quai vạc) chạy dài hai bờ sông từ đầu nguồn ra biển; hai đốm ngà (Hà đê chánh phó sứ); người (son) đắp thêm sau mùa lũ; các đốm ngà (quan khám đê) đi dọc đê
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "mua-lu": { ...shot([60, 0, 0], 180, 240, 110, 1), mood: MOOD.overcast + 0.5 },
    "dap-de": { ...shot([DE[0], 0, DE[1]], 170, 230, 110, -1), mood: MOOD.day },
    "de-quai-vac": { ...shot([100, 0, 0], 90, 360, 200, 1), mood: MOOD.dawn + 0.5 },
    "ve-sau": { ...shot([60, 0, 0], 180, 280, 150, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
