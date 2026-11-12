import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Rừng Sác (RUNG) giữa; thành phố (THANH_PHO) bắc; biển phía nam.
// Hoạt cảnh trong từng phân cảnh: ba vòng đốm (vùng lõi vàng, vùng đệm ngà, vùng chuyển tiếp xanh nhạt) vẽ ranh khu dự trữ sinh quyển; theo thanh kéo, người trồng rừng (son) tỏa khắp bãi bùn; cây non (đốm xanh lá) mọc lên thành lưới; đốm vàng lớn (khu dự trữ sinh quyển) sáng; đàn chim (chấm xanh nhạt) bay vòng; muông thú (đốm ngà) rải khắp rừng; dòng đốm xanh nhạt (nước, không khí) từ thành phố chảy về rừng và hoá vàng khi ra biển
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "rung-sac": { ...shot([30, 0, 0], 80, 260, 150, 1), mood: MOOD.dawn + 0.5 },
    "trong-lai": { ...shot([30, 0, -20], 80, 220, 110, -1), mood: MOOD.sunset + 0.6 },
    "sinh-quyen": { ...shot([30, 0, 0], 85, 230, 130, 1), mood: MOOD.sunset + 0.65 },
    "la-phoi": { ...shot([0, 0, 140], 80, 270, 160, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
