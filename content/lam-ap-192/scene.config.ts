import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Huyện thành (HUYEN_THANH) gần cửa sông; Khu Lật (KHU_LAT) bờ bắc; biển phía đông.
// Hoạt cảnh trong từng phân cảnh: đốm xanh nhạt (huyện thành của chính quyền đô hộ); dân các làng (son) kéo lên phía bắc, lửa bùng ở Tây Quyển; theo thanh kéo, người các làng (son) kéo về huyện thành; quan lại (xanh nhạt) rút đi; đốm vàng (nước Lâm Ấp) sáng lên; thành Khu Lật đắp lên bên bờ bắc; dân (son) tụ quanh; đốm vàng giữa thành; chuỗi đốm ngà dọc bờ biển về phía nam (nước dời dần về phía nam, thành Chăm Pa); thuyền (ngà) xuôi nam
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "tuong-lam": { ...shot([-40, 0, 120], 75, 300, 150, 1), mood: MOOD.dawn + 0.5 },
    "lap-nuoc": { ...shot([60, 0, -50], 80, 230, 100, -1), mood: MOOD.sunset + 0.55 },
    "khu-lat": { ...shot([-40, 0, 110], 70, 220, 110, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([120, 0, -20], 100, 300, 170, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
