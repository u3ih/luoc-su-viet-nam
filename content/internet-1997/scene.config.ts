import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (HA_NOI) bắc; Thành phố Hồ Chí Minh (HCM) nam; biển đông.
// Hoạt cảnh trong từng phân cảnh: đốm vàng ở Hà Nội; chuỗi đốm ngà (đường dây điện thoại) nối ra biển tới phía đông nam xa (nước Úc); bốn điểm thử nghiệm (đốm vàng) ở Hà Nội và Thành phố Hồ Chí Minh, mỗi điểm nối ra một cổng quốc tế (chuỗi đốm ngà); theo thanh kéo, các điểm kết nối (đốm vàng) lần lượt sáng khắp dải đất; người dùng (son) tụ về quanh các điểm sáng; mạng lưới (đốm vàng) sáng đều
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "thu-dien-tu": { ...shot([60, 0, 160], 30, 270, 150, 1), mood: MOOD.dawn + 0.5 },
    "thu-nghiem": { ...shot([-10, 0, 0], 0, 290, 220, -1), mood: MOOD.sunset + 0.55 },
    "hoa-mang": { ...shot([-10, 0, 0], 5, 300, 240, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([-10, 0, 0], 0, 290, 220, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
