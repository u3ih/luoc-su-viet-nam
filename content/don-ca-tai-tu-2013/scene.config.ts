import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { XOM_A } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông lớn ngang cảnh, kênh rạch; các xóm (XOM_*) ven kênh.
// Hoạt cảnh trong từng phân cảnh: ghe (chấm ngà) trên kênh rạch; các xóm (đốm ngà nhỏ) có nhóm đờn lúc nông nhàn; theo thanh kéo, đốm vàng (nhạc sư từ Huế) tới, rồi các nhóm đờn ca (đốm vàng) lần lượt sáng khắp các xóm; bốn đốm (kìm, tranh, cò, bầu) ngồi quây quần; người nghe (son) vây quanh; khắp đồng bằng sáng các nhóm đờn ca (đốm vàng); ghe (son) qua lại
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "nguon-goc": { ...shot([0, 0, 40], 80, 300, 130, 1), mood: MOOD.dawn + 0.5 },
    "nhac-su": { ...shot([0, 0, 40], 80, 330, 160, -1), mood: MOOD.sunset + 0.65 },
    "nhac-cu": { ...shot([XOM_A[0], 0, XOM_A[1]], 80, 130, 45, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([0, 0, 30], 85, 300, 140, -1), mood: MOOD.sunset + 0.55 },
  },
};

export default config;
