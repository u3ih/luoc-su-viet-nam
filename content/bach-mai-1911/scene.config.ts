import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Bệnh viện (BENH_VIEN) giữa; Hà Nội (HA_NOI) bắc.
// Hoạt cảnh trong từng phân cảnh: nhà thương nhỏ (vài đốm ngà) sáng; về sau tuyến tàu điện (chuỗi đốm, chấm vàng) nối từ trung tâm tới cửa nhà thương; bệnh viện mở rộng (lưới đốm ngà lớn dần); thầy thuốc và người bệnh (son) ra vào; theo thanh kéo, các khoa phòng (đốm vàng) lần lượt sáng đèn trở lại; người (son) quây quần; bệnh viện lớn (lưới đốm vàng rộng, cột đốm — các toà nhà cao); dòng người bệnh (son) từ nhiều nơi đổ về
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "cong-vong": { ...shot([10, 0, 80], 80, 250, 140, 1), mood: MOOD.dawn + 0.5 },
    "bach-mai": { ...shot([0, 0, -20], 80, 200, 110, -1), mood: MOOD.sunset + 0.6 },
    "nam-1972": { ...shot([0, 0, -20], 85, 180, 100, 1), mood: MOOD.sunset + 0.6 },
    "ngay-nay": { ...shot([0, 0, -20], 75, 220, 130, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
