import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Trung tâm (TRUNG_TAM) giữa; Bản Giốc (BAN_GIOC) đông bắc; Thang Hen (THANG_HEN) tây bắc; Phia Oắc (PHIA_OAC) tây nam.
// Hoạt cảnh trong từng phân cảnh: cột đốm từ xanh nhạt đến vàng (các lớp đá qua 500 triệu năm) dựng lên giữa thung lũng; các nhà khoa học và người dân (ngà, son) tụ về trung tâm làm hồ sơ; theo thanh kéo, các điểm di sản địa chất (đốm vàng) lần lượt sáng khắp vùng núi đá; các bản làng (đốm ngà) quanh thung lũng; người dân (son) đi chợ, lên nương
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "dia-chat": { ...shot([0, 0, 20], 80, 200, 100, 1), mood: MOOD.dawn + 0.5 },
    "ho-so": { ...shot([0, 0, 20], 85, 190, 100, -1), mood: MOOD.sunset + 0.6 },
    "ghi-danh": { ...shot([0, 0, 40], 80, 270, 160, 1), mood: MOOD.sunset + 0.7 },
    "cong-dong": { ...shot([-60, 0, 0], 75, 230, 120, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
