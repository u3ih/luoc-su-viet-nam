import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { YEN_SON, TRUONG_THI } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Mỹ Lương (MY_LUONG) tây; Quốc Oai (QUOC_OAI), Ứng Hòa (UNG_HOA), Thanh Oai (THANH_OAI) đông; Yên Sơn (YEN_SON); TRUONG_THI, PHU_THI tượng trưng.
// Hoạt cảnh trong từng phân cảnh: các đốm vàng nhỏ (bài thi) sáng ở trường thi; đốm ngà ở giữa rồi lịm (bị giam); đốm ngà đến phủ Quốc Oai, rồi rời đi về quê Phú Thị; các toán người (son) từ núi rừng Mỹ Lương kéo xuống các phủ huyện theo thanh kéo, lửa bùng ở Quốc Oai, Ứng Hòa, Thanh Oai; quân triều đình (xanh nhạt) từ đồng bằng tiến lên núi Yên Sơn; người (son) giữ chân núi; đốm ngà lịm dần, lửa bùng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [330,160,-320], look: [-40,0,40], mood: MOOD.dawn + 0.3 },
    "truong-thi": { ...shot([TRUONG_THI[0], 0, TRUONG_THI[1]], 290, 200, 90, 1), mood: MOOD.sunset + 0.6 },
    "quoc-oai": { ...shot([150, 0, 200], 70, 300, 140, -1), mood: MOOD.overcast + 0.3 },
    "my-luong": { ...shot([0, 0, 0], 160, 330, 170, 1), mood: MOOD.sunset + 0.4 },
    "ket-cuc": { ...shot([YEN_SON[0], 0, YEN_SON[1]], 130, 220, 110, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
