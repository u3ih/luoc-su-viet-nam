import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Cầu Đá (CAU_DA) bờ tây; ngoài khơi (KHOI) đông.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (sở hải dương học) sáng ở Cầu Đá; các nhà nghiên cứu (ngà) tụ về; những vòng đốm xanh nhạt và ngà (bể cá) ven bờ; hàng đốm vàng dài (bộ xương cá voi 18 m); theo thanh kéo, tàu khảo sát (chấm ngà) ra khơi đi một vòng; các trạm đo (đốm xanh nhạt) lần lượt sáng dọc đường; các vùng sinh thái biển (rạn san hô, cỏ biển — đốm vàng, xanh nhạt) sáng quanh viện; khách tham quan (son)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "thanh-lap": { ...shot([-20, 0, -20], 75, 190, 90, 1), mood: MOOD.dawn + 0.5 },
    "ho-ca": { ...shot([10, 0, -20], 80, 170, 70, -1), mood: MOOD.sunset + 0.65 },
    "khao-sat": { ...shot([110, 0, -30], 80, 260, 140, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([30, 0, 0], 75, 250, 120, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
