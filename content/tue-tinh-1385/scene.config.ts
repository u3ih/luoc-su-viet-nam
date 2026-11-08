import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HO_XA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hương Xưa (HUONG_XUA) tây, Hải Triều (HAI_TRIEU) nam, Hộ Xá (HO_XA) đông; PHUONG_BAC là hướng đi phương bắc.
// Hoạt cảnh trong từng phân cảnh: một đốm ngà nhỏ đi từ hương Xưa về chùa Hải Triều; các nhà sư (son) ở chùa; đốm vàng sáng ở chùa; những đốm xanh vàng (vườn thuốc) lan dần ra quanh chùa Hộ Xá theo thanh kéo; người (son) từ các làng tìm đến; đốm ngà (Tuệ Tĩnh) bị đưa đi về phương bắc cùng một đoàn chấm xanh nhạt; người (son) đứng lặng ở Hộ Xá; một đốm ngà (tấm bia chép lại) theo đường từ phương bắc về hương Xưa; đốm vàng sáng ở hương Xưa, người (son) tụ lại
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-300,150,-300], look: [20,0,20], mood: MOOD.dawn + 0.3 },
    "o-chua": { ...shot([-60, 0, -60], 50, 280, 130, 1), mood: MOOD.day },
    "nam-duoc": { ...shot([HO_XA[0], 0, HO_XA[1]], 70, 230, 110, -1), mood: MOOD.sunset + 0.5 },
    "di-cong": { ...shot([130, 0, 230], 80, 300, 140, 1), mood: MOOD.overcast + 0.3 },
    "ve-sau": { ...shot([-40, 0, 240], 120, 300, 140, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
