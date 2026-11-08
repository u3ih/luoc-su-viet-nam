import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HUE } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển phía đông; Bắc thành (BAC_THANH) bắc, Huế (HUE) giữa, Gia Định (GIA_DINH) nam. Các đốm tỉnh là tượng trưng, không phải vị trí thật.
// Hoạt cảnh trong từng phân cảnh: ba đốm vàng lớn: Bắc thành, kinh đô, Gia Định thành; hai đốm xanh nhạt (tổng trấn) tắt; ba mươi đốm vàng (ba mươi tỉnh) lần lượt sáng từ bắc vào nam theo thanh kéo, đốm ngà ở Thừa Thiên; đốm vàng lớn ở kinh đô sáng rực (chiếu đổi quốc hiệu); người (son) tụ về; các đốm vàng (các tỉnh) sáng đều khắp dải đất
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "truoc-1831": { ...shot([0, 0, 0], 270, 360, 200, 1), mood: MOOD.day },
    "chia-tinh": { ...shot([0, 0, 0], 270, 380, 210, -1), mood: MOOD.sunset + 0.6 },
    "quoc-hieu": { ...shot([HUE[0], 0, HUE[1]], 80, 220, 100, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([0, 0, 0], 270, 380, 210, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
