import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { QUAN_THE } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Quần thể (QUAN_THE) giữa; hồ (HO) phía nam; biển đông nam.
// Hoạt cảnh trong từng phân cảnh: đất bồi ven biển; người (son) chở đá đắp một khối núi đá (cụm đốm ngà) để thử độ lún; theo thanh kéo: nhà thờ đá (đốm ngà) trước, rồi nhà thờ lớn (hàng đốm vàng dài), bốn nhà nguyện, cuối cùng phương đình (cột đốm cao); các hàng đốm vàng (48 cột gỗ lim) sáng dọc lòng nhà thờ lớn; nhiều đốm vàng ấm (đèn) sáng khắp quần thể và soi xuống hồ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "dat-moi-boi": { ...shot([40, 0, 20], 120, 260, 120, 1), mood: MOOD.day },
    "xay-dung": { ...shot([QUAN_THE[0], 0, QUAN_THE[1]], 90, 170, 60, -1), mood: MOOD.sunset + 0.5 },
    "kien-truc": { ...shot([QUAN_THE[0], 0, QUAN_THE[1]], 80, 140, 50, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([QUAN_THE[0], 0, QUAN_THE[1]], 90, 200, 70, -1), mood: MOOD.sunset + 0.75 },
  },
};

export default config;
