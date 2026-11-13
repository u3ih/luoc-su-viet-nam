import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sài Gòn (SAI_GON) giữa; Cây Mai (CAY_MAI) tây; Tân Sơn Nhất (TSN) bắc; miền Tây (MIEN_TAY) tây nam.
// Hoạt cảnh trong từng phân cảnh: đoàn quân Anh và Pháp (xanh nhạt) từ phía sông tiến vào Sài Gòn; các công sở (đốm ngà) đổi màu; theo thanh kéo, các lãnh đạo Nam Bộ (ngà) rời Sài Gòn tụ về phố Cây Mai (đốm vàng); tự vệ (son) từ ngoại ô khép vòng quanh Sài Gòn; lửa ở chợ Bến Thành; dân (ngà) tản cư ra nông thôn; đoàn quân Nam tiến (son) từ phía bắc xuống; các tỉnh miền Tây (đốm xanh nhạt) lần lượt bị chiếm; lực lượng kháng chiến (son) rút vào chiến khu
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "quan-anh": { ...shot([60, 0, 40], 85, 200, 100, 1), mood: MOOD.overcast + 0.6 },
    "cay-mai": { ...shot([-110, 0, 10], 90, 160, 70, -1), mood: MOOD.dawn + 0.6 },
    "vay-thanh": { ...shot([40, 0, 80], 80, 230, 120, 1), mood: MOOD.sunset + 0.65 },
    "lan-rong": { ...shot([-140, 0, -120], 60, 250, 140, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
