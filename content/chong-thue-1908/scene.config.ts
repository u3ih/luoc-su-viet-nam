import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đại Lộc (DAI_LOC) tây, Vĩnh Điện (VINH_DIEN) giữa, Hội An (HOI_AN) đông gần biển; BAC, NAM hướng các tỉnh khác.
// Hoạt cảnh trong từng phân cảnh: dân phu (son) dàn hàng dọc con đường từ Đại Lộc đi tỉnh lỵ; đốm vàng ở Phiếm Ái (nơi bàn làm đơn); đoàn người (son) từ Đại Lộc qua bến đò Vĩnh Điện về Hội An theo thanh kéo, người hai bên đường nhập vào, đốm vàng ở Hội An; những đốm vàng (các tỉnh hưởng ứng) sáng dần ở phía bắc và phía nam; các đoàn người (son) đi từ nhiều ngả; những chấm xanh nhạt (người bị đày) theo thuyền rời Hội An ra biển xa; người (son) đứng lặng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [40,0,40], mood: MOOD.dawn + 0.3 },
    "nguyen-nhan": { ...shot([-180, 0, 60], 70, 240, 110, 1), mood: MOOD.day },
    "hoi-an": { ...shot([0, 0, 20], 85, 340, 160, -1), mood: MOOD.day },
    "lan-rong": { ...shot([60, 0, 0], 90, 340, 190, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([260, 0, -200], 30, 300, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
