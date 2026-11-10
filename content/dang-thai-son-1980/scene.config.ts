import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (HA_NOI) tây nam; Yên Dũng (YEN_DUNG); Moskva (MOSKVA) bắc; Warszawa (WARSZAWA) đông.
// Hoạt cảnh trong từng phân cảnh: đốm vàng nhỏ (cậu bé học đàn) ở Hà Nội; theo nhạc viện (chấm người son) sơ tán về Yên Dũng; chấm vàng (Đặng Thái Sơn) đi từ Hà Nội lên Moskva; đốm ngà (nhạc viện) sáng lên; theo thanh kéo, khán phòng (vòng đốm ngà) sáng dần; đốm vàng giữa sân khấu bừng sáng; các đốm vàng (những khán phòng trên thế giới) lần lượt sáng thành vòng lớn
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "tuoi-tho": { ...shot([-180, 0, -150], 60, 220, 120, 1), mood: MOOD.dawn + 0.5 },
    "moskva": { ...shot([-120, 0, 60], 80, 270, 150, -1), mood: MOOD.sunset + 0.55 },
    "chopin": { ...shot([180, 0, 80], 80, 200, 110, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([0, 0, 0], 70, 270, 150, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
