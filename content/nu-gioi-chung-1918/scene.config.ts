import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { TOA_SOAN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Tòa soạn (TOA_SOAN) giữa; sông phía đông; Ba Tri (BA_TRI) tây nam.
// Hoạt cảnh trong từng phân cảnh: đốm ngà (Sương Nguyệt Anh) rời Ba Tri lên Sài Gòn; đốm vàng sáng ở tòa soạn; những vòng sóng vàng (tiếng chuông) lan từ tòa soạn ra khắp Nam Kỳ theo thanh kéo; người đọc (son) ở nhiều nơi; hai mươi hai đốm vàng nhỏ (hai mươi hai số báo) xếp hàng rồi đốm cuối tắt; nhiều đốm ngà (phụ nữ) sáng dần khắp vùng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "suong-nguyet-anh": { ...shot([-150, 0, -130], 230, 300, 150, 1), mood: MOOD.day },
    "so-dau": { ...shot([TOA_SOAN[0], 0, TOA_SOAN[1]], 80, 340, 180, -1), mood: MOOD.sunset + 0.5 },
    "dinh-ban": { ...shot([TOA_SOAN[0], 0, TOA_SOAN[1]], 80, 180, 80, 1), mood: MOOD.overcast + 0.5 },
    "ve-sau": { ...shot([0, 0, 0], 80, 360, 190, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
