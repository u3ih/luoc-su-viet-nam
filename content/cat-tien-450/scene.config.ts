import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { TRUNG_TAM } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Đồng Nai uốn vòng; các gò (GO_*) ven bờ; trung tâm (TRUNG_TAM).
// Hoạt cảnh trong từng phân cảnh: vài chấm ngà (cán bộ bảo tàng) đi dọc bờ sông; đốm vàng mờ (di vật người dân nhặt được) rải rác; theo thanh kéo, từng gò lần lượt được khai quật: nền đền (cụm đốm vàng) hiện ra, lối đốm ngà dẫn xuống bờ sông; hàng trăm đốm vàng li ti (mảnh vàng chạm thần linh) lấp lánh quanh trung tâm; các gò còn sáng mờ; ba đốm câu hỏi (ngà) lơ lửng trên thánh địa (chủ nhân còn tranh luận)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "ban-dia": { ...shot([0, 0, 0], 270, 300, 160, 1), mood: MOOD.dawn + 0.5 },
    "khai-quat": { ...shot([TRUNG_TAM[0], 0, TRUNG_TAM[1]], 270, 200, 90, -1), mood: MOOD.sunset + 0.5 },
    "hien-vat": { ...shot([TRUNG_TAM[0], 0, TRUNG_TAM[1]], 270, 140, 55, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([0, 0, 0], 270, 280, 150, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
