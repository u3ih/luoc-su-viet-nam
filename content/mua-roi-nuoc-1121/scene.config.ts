import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Ao (AO) giữa; thuỷ đình (THUY_DINH) bờ bắc ao; làng (LANG) tây.
// Hoạt cảnh trong từng phân cảnh: dân làng (son) từ ruộng kéo về quanh ao xem hội; đốm vàng (thuỷ đình) sáng ở bờ ao; theo thanh kéo, rùa vàng (đốm vàng) nổi lên giữa ao, đội ba ngọn núi (ba cột đốm); cửa động mở, tiên (đốm ngà) và chim thú (đốm xanh nhạt) hiện ra; thuỷ đình (hàng đốm vàng) sáng ở bờ ao; các con rối (chấm ngà) đi ra mặt nước; khán giả (son) quanh ao; các phường rối (đốm ngà) quanh vùng sáng lần lượt; một đốm vàng lớn (nhà hát phục hồi 17 trò) sáng sau cùng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "lua-nuoc": { ...shot([0, 0, 10], 80, 200, 90, 1), mood: MOOD.dawn + 0.5 },
    "bia-1121": { ...shot([0, 0, 0], 90, 140, 60, -1), mood: MOOD.sunset + 0.65 },
    "thuy-dinh": { ...shot([0, 0, 20], 85, 150, 60, 1), mood: MOOD.sunset + 0.7 },
    "phuong-roi": { ...shot([-80, 0, 30], 75, 230, 110, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
