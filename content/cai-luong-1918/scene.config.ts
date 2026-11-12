import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Mỹ Tho (MY_THO) giữa; Vĩnh Long (VINH_LONG), Sa Đéc (SA_DEC) tây; Sài Gòn (SAI_GON) đông bắc.
// Hoạt cảnh trong từng phân cảnh: vòng nhỏ đốm ngà (ban đờn ca tài tử) ở Mỹ Tho; người nghe (son) ngồi vòng ngoài; một người khách (chấm ngà) theo đường xe lửa về Vĩnh Long; ở đó đốm vàng (ca ra bộ) sáng; sau đó gánh xiếc Sa Đéc (đốm ngà) sáng; theo thanh kéo, hàng đốm vàng (màn sân khấu) mở dần từ giữa ra; gánh hát (ngà) bước lên; khán giả (son) ngồi kín; đốm vàng lan dần từ Sài Gòn lên phía bắc (cải lương lan ra Bắc); các gánh hát (ngà) đi các nơi
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "tai-tu": { ...shot([-60, 0, -40], 75, 170, 70, 1), mood: MOOD.sunset + 0.6 },
    "ca-ra-bo": { ...shot([-170, 0, -70], 80, 250, 130, -1), mood: MOOD.sunset + 0.6 },
    "dem-1918": { ...shot([140, 0, 130], 80, 170, 70, 1), mood: MOOD.sunset + 0.75 },
    "lan-rong": { ...shot([40, 0, 80], 80, 270, 160, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
