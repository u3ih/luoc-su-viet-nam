import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hồ (HO) giữa; làng (LANG) bờ nam; sông Năng chảy về đông.
// Hoạt cảnh trong từng phân cảnh: mặt hồ giữa núi đá; dải đốm ngà chạy dọc chiều dài hồ (8 km, cách điệu); theo thanh kéo, vòng đốm vàng (ranh giới vườn quốc gia) khép dần quanh hồ; vòng trong (phân khu bảo vệ nghiêm ngặt) sáng sau; các loài (đốm xanh nhạt: cá dưới hồ; đốm ngà: lan trên vách; đốm vàng: chim) rải quanh hồ; thuyền độc mộc (chấm ngà) đi trên hồ ra sông Năng; làng ven hồ (đốm vàng) sáng đèn
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "ho-tren-nui": { ...shot([-20, 0, 10], 80, 220, 110, 1), mood: MOOD.dawn + 0.5 },
    "vuon-quoc-gia": { ...shot([-20, 0, 10], 85, 250, 150, -1), mood: MOOD.sunset + 0.6 },
    "da-dang": { ...shot([-20, 0, 10], 75, 180, 80, 1), mood: MOOD.sunset + 0.65 },
    "song-nang": { ...shot([120, 0, -10], 70, 200, 90, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
