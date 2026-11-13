import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Dinh Độc Lập (DINH) giữa; Tân Sơn Nhất (TSN) tây bắc; Xuân Lộc (XUAN_LOC) đông bắc.
// Hoạt cảnh trong từng phân cảnh: tuyến phòng thủ Xuân Lộc (đốm xanh nhạt) giữ một thời gian rồi tắt; các đơn vị (son) từ phía bắc tiến tới; theo thanh kéo, năm cánh quân (son) từ năm hướng tiến vào trung tâm; năm mục tiêu (đốm xanh nhạt) giữa thành phố; trực thăng (đốm xanh nhạt) bay từ thành phố ra biển phía đông; đoàn người (ngà) tụ ở các điểm đón; các đơn vị (son) đến trước Dinh Độc Lập (đốm xanh nhạt tắt); đốm vàng sáng trên nóc dinh
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "xuan-loc": { ...shot([300, 0, 260], 60, 200, 160, 1), mood: MOOD.overcast + 0.6 },
    "nam-canh": { ...shot([0, 0, 20], 85, 290, 170, -1), mood: MOOD.sunset + 0.6 },
    "di-tan": { ...shot([40, 0, 60], 70, 230, 120, 1), mood: MOOD.sunset + 0.65 },
    "dinh-doc-lap": { ...shot([0, 0, 20], 90, 160, 60, -1), mood: MOOD.day },
  },
};

export default config;
