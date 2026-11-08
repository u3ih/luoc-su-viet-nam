import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { LUNG_DONG, KINH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Lũng Động (LUNG_DONG) đông, kinh đô (KINH) tây; PHUONG_BAC là hướng đi sứ.
// Hoạt cảnh trong từng phân cảnh: văn sĩ (son) bốn phương tụ về học đường; một đốm ngà nhỏ (Mạc Đĩnh Chi) đi từ Lũng Động tới; đốm ngà đến kinh đô dự thi; ba đốm vàng (Tam khôi) sáng; một đốm sen (hồng) nở bên cạnh; sứ đoàn (chấm ngà) rời kinh đô theo đường núi lên phương Bắc theo thanh kéo; sứ đoàn trở về kinh đô; đốm vàng sáng ở kinh đô
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "hoc-duong": { ...shot([LUNG_DONG[0], 0, LUNG_DONG[1]], 80, 220, 100, 1), mood: MOOD.day },
    "trang-nguyen": { ...shot([KINH[0], 0, KINH[1]], 80, 220, 100, -1), mood: MOOD.day },
    "di-su": { ...shot([-40, 0, 200], 60, 330, 170, 1), mood: MOOD.overcast + 0.4 },
    "ve-sau": { ...shot([KINH[0], 0, KINH[1]], 70, 230, 110, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
