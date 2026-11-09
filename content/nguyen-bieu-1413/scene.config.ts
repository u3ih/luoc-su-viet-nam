import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Lam ngang giữa cảnh; doanh trại Hậu Trần (DOANH) bờ nam; trại Trương Phụ (TRAI_PHU) bờ bắc; cầu (CAU).
// Hoạt cảnh trong từng phân cảnh: làng Bình Hồ (đốm ngà); nghĩa quân nhà Hậu Trần (son) đóng ở doanh trại; chấm ngà (Nguyễn Biểu) tới doanh trại; theo thanh kéo, thuyền sứ thần (đốm ngà) qua sông sang trại Trương Phụ (quân xanh nhạt); đốm ngà (Nguyễn Biểu) bên chân cầu; nước triều dâng — đốm ngà lịm dần; quân (xanh nhạt) đứng trên bờ; đền thờ ông (đốm vàng) ở Bình Hồ và bên sông Lam; người đến viếng (son)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "binh-ho": { ...shot([-180, 0, -130], 80, 200, 90, 1), mood: MOOD.dawn + 0.5 },
    "di-su": { ...shot([0, 0, -10], 80, 300, 160, -1), mood: MOOD.sunset + 0.55 },
    "doi-dap": { ...shot([140, 0, 30], 85, 220, 100, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([-120, 0, -40], 80, 300, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
