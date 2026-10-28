import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CAN_GIUOC, NHAT_TAO, SAI_GON, TE_DAN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông lớn chảy từ tây bắc xuống đông nam, vàm Nhật Tảo (NHAT_TAO) ở phía tây; sông từ Sài Gòn (SAI_GON, phía
// bắc) xuống bên đồn Cần Giuộc (CAN_GIUOC, phía đông); bãi làm lễ tế (TE_DAN) ở giữa. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (quân đi từ Sài Gòn xuống rồi các toán nghĩa quân nổi lên ở các làng, người tụ về vàm sông, nghĩa binh tụ về đồn, người tụ về
// bãi lễ và đốm sáng đi nhờ viết văn tế, thắp đèn tưởng niệm) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330, 190, -300], look: [30, 0, 60], mood: MOOD.dawn + 0.3 },
    "boi-canh": { ...shot([SAI_GON[0] - 60, 0, 180], 90, 250, 150, 1, 0.2), mood: MOOD.overcast + 0.3 },
    "nhat-tao": { ...shot([NHAT_TAO[0] + 10, 0, NHAT_TAO[1] + 10], 0, 200, 80, -1), mood: MOOD.day },
    "can-giuoc": { ...shot([CAN_GIUOC[0] - 10, 0, CAN_GIUOC[1]], 90, 230, 90, 1), mood: MOOD.sunset + 0.5 },
    "le-te": { ...shot([TE_DAN[0], 0, TE_DAN[1]], 30, 190, 85, -1), mood: MOOD.dawn + 0.8 },
    "van-te": { ...shot([TE_DAN[0], 0, TE_DAN[1]], 150, 200, 80, 1), mood: MOOD.night - 0.2 },
  },
};

export default config;
