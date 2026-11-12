import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (HA_NOI) bắc; Mỹ Sơn (MY_SON) giữa; Sài Gòn (SAI_GON) nam; Angkor (ANGKOR) tây nam.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (viện) sáng ở Sài Gòn năm 1900, rồi theo đường ven biển dời ra Hà Nội (1902); các nhóm nghiên cứu (ngà) từ Hà Nội tỏa đi Mỹ Sơn và Angkor; vòng đốm (các công trình được ghi nhận) sáng ở Mỹ Sơn; theo thanh kéo, cột đốm vàng (thư viện) cao dần ở Hà Nội; các bảo tàng (đốm ngà) sáng; đốm Hà Nội tắt (1957), đoàn (ngà) rời về phía Angkor rồi ra khỏi cảnh; về sau đốm Hà Nội sáng lại (1993)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "ra-doi": { ...shot([20, 0, 0], 85, 270, 170, 1), mood: MOOD.dawn + 0.5 },
    "khao-sat": { ...shot([0, 0, 0], 80, 270, 170, -1), mood: MOOD.sunset + 0.55 },
    "thu-vien": { ...shot([-60, 0, 260], 80, 200, 100, 1), mood: MOOD.sunset + 0.65 },
    "tro-lai": { ...shot([-60, 0, 60], 80, 270, 160, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
