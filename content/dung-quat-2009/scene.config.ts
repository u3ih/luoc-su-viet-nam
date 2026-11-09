import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển phía đông; nhà máy (NHA_MAY) trên bờ; cảng (CANG) ngoài vịnh.
// Hoạt cảnh trong từng phân cảnh: địa điểm bên vịnh (đốm ngà); tàu (chấm xanh nhạt) tới thăm dò rồi rời đi; theo thanh kéo, các phân xưởng (đốm vàng) lần lượt sáng; đê chắn sóng và cảng (chuỗi đốm ngà) vươn ra biển; công nhân (son); dòng sản phẩm đầu tiên: ngọn đuốc cháy; tàu chở sản phẩm (chấm ngà) rời cảng; nhà máy sáng đèn; tàu (chấm ngà) ra vào cảng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "dia-diem": { ...shot([80, 0, 20], 80, 280, 150, 1), mood: MOOD.dawn + 0.5 },
    "xay-dung": { ...shot([40, 0, 20], 70, 260, 150, -1), mood: MOOD.sunset + 0.6 },
    "san-pham": { ...shot([60, 0, 20], 85, 230, 110, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([100, 0, 20], 60, 300, 160, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
