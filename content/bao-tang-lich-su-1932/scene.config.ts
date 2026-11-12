import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Bảo tàng (BAO_TANG) giữa; Nhà hát Lớn (NHA_HAT) tây; sông Hồng đông.
// Hoạt cảnh trong từng phân cảnh: bản vẽ (vòng đốm ngà tám cạnh mờ) hiện ở khu đất sau Nhà hát Lớn; thợ (son) tới làm móng; theo thanh kéo, vòng tường tám cạnh dựng lên; ba tầng vòng đốm vàng (ba lớp mái) lần lượt sáng phía trên; các hiện vật Đông Nam Á (đốm xanh nhạt) trong bảo tàng; năm 1958 đốm vàng (Bảo tàng Lịch sử Việt Nam) sáng; những hiện vật quý (đốm vàng: trống đồng, cọc Bạch Đằng…) sáng; khách tham quan (son) xếp hàng vào
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "thiet-ke": { ...shot([-40, 0, 0], 80, 220, 120, 1), mood: MOOD.dawn + 0.5 },
    "sanh-bat-giac": { ...shot([20, 0, 0], 80, 150, 80, -1), mood: MOOD.sunset + 0.6 },
    "ban-giao": { ...shot([20, 0, 0], 70, 180, 90, 1), mood: MOOD.sunset + 0.65 },
    "ngay-nay": { ...shot([20, 0, 0], 85, 160, 80, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
