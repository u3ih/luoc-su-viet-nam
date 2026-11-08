import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { XA_DOAI, HUE } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển phía đông; Xã Đoài (XA_DOAI) bắc, Huế (HUE) nam; RA_KHOI hướng ra biển xa.
// Hoạt cảnh trong từng phân cảnh: đốm ngà (thầy giáo) ở Xã Đoài; học trò (son) tụ lại; chấm ngà theo thuyền ra biển xa, rồi trở về theo đường biển phía nam; các đốm vàng (những bản điều trần) lần lượt đi từ Xã Đoài vào kinh đô Huế theo thanh kéo; đốm vàng ở Huế vẫn mờ (không được phúc đáp); một vệt sáng dọc kênh Sắt; chấm ngà (phái đoàn) rời Huế ra biển đi xa rồi trở về sau tám tháng; đốm ngà đi gấp vào Huế, đốm vàng ở Huế chập chờn rồi lịm; người (son) ở Huế bàn đi tính lại
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [40,0,40], mood: MOOD.dawn + 0.3 },
    "thay-lan": { ...shot([XA_DOAI[0], 0, XA_DOAI[1]], 90, 220, 100, 1), mood: MOOD.day },
    "ra-ngoai": { ...shot([200, 0, 100], 20, 300, 150, -1), mood: MOOD.sunset + 0.5 },
    "dieu-tran": { ...shot([0, 0, 40], 90, 340, 170, 1), mood: MOOD.sunset + 0.5 },
    "sang-phap": { ...shot([200, 0, -100], 20, 320, 150, -1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([HUE[0], 0, HUE[1]], 270, 230, 110, 1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
