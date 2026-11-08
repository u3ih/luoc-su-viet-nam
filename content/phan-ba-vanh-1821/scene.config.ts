import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { TRA_LU } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển phía nam; Trà Lũ (TRA_LU) giữa, Trà Lý (TRA_LY), Lân Hải (LAN_HAI), Cồn Tiên (CON_TIEN) đông, Giao Thủy (GIAO_THUY) tây nam.
// Hoạt cảnh trong từng phân cảnh: người đói (son) từ các làng tụ về Trà Lũ, đốm ngà sáng ở Trà Lũ; nghĩa quân (son) từ Trà Lũ tỏa về các đồn Trà Lý, Lân Hải, Cồn Tiên theo thanh kéo, lửa bùng lên ở các đồn; quân triều đình (xanh nhạt) từ phía bắc kéo xuống Giao Thủy; thuyền triều đình (xanh nhạt) theo biển vào cửa sông; quân triều đình (xanh nhạt) khép vòng về Trà Lũ, đốm ngà lịm dần, lửa bùng ở Trà Lũ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-300,150,-320], look: [20,0,40], mood: MOOD.dawn + 0.3 },
    "nam-doi": { ...shot([TRA_LU[0], 0, TRA_LU[1]], 80, 220, 100, 1), mood: MOOD.overcast + 0.3 },
    "tra-lu": { ...shot([100, 0, -40], 80, 300, 140, -1), mood: MOOD.sunset + 0.4 },
    "hoi-tieu": { ...shot([-60, 0, 60], 80, 330, 160, 1), mood: MOOD.overcast + 0.4 },
    "ket-cuc": { ...shot([TRA_LU[0], 0, TRA_LU[1]], 70, 230, 110, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
