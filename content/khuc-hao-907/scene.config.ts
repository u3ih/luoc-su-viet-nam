import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. La Thành (LA_THANH) giữa; các giáp quanh đồng bằng; Quảng Châu (QUANG_CHAU) đông bắc.
// Hoạt cảnh trong từng phân cảnh: Khúc Hạo (chấm ngà) đến La Thành (đốm vàng); xa phía đông bắc, đốm xanh nhạt (họ Lưu ở Quảng Châu); các giáp (đốm ngà) lần lượt sáng khắp đồng bằng; theo thanh kéo, dân (son) các làng về giáp ghi sổ hộ khẩu; các giáp chuyển sang đốm vàng; sứ đoàn Khúc Thừa Mỹ (chấm ngà) từ La Thành sang Quảng Châu; đốm xanh nhạt ở Quảng Châu sáng mạnh hơn
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "ke-nghiep": { ...shot([60, 0, 20], 80, 260, 140, 1), mood: MOOD.dawn + 0.5 },
    "giap": { ...shot([0, 0, 0], 75, 270, 150, -1), mood: MOOD.sunset + 0.55 },
    "thue": { ...shot([-20, 0, 0], 80, 270, 150, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([150, 0, 150], 50, 270, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
