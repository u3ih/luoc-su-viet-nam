import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { NHA_TRANG, LAM_VIEN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển phía đông; Nha Trang (NHA_TRANG), Suối Dầu (SUOI_DAU) ven biển; Lâm Viên (LAM_VIEN) tây bắc, Di Linh (DI_LINH) tây nam.
// Hoạt cảnh trong từng phân cảnh: đoàn thám hiểm (chấm ngà) rời Nha Trang theo đường núi đi về phía tây; đoàn thám hiểm (chấm ngà) từ phía nam qua Di Linh lên cao nguyên Lâm Viên theo thanh kéo; các làng người Lạch (son) trên cao nguyên; đốm vàng sáng ở Lâm Viên; đốm vàng (phòng thí nghiệm) sáng ở Nha Trang, rồi ở Suối Dầu; người (son) tụ đến; các đốm vàng (thành phố mới) sáng dần trên cao nguyên Lâm Viên; một đốm ngà đi từ cao nguyên về Nha Trang
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [330,160,-320], look: [-60,30,60], mood: MOOD.dawn + 0.3 },
    "nha-trang": { ...shot([100, 0, -80], 180, 260, 150, 1), mood: MOOD.day },
    "lam-vien": { ...shot([-160, 0, 20], 100, 330, 200, -1), mood: MOOD.day },
    "dich-hach": { ...shot([NHA_TRANG[0], 0, NHA_TRANG[1]], 60, 220, 100, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([LAM_VIEN[0], 0, LAM_VIEN[1]], 120, 260, 190, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
