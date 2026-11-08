import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { RUONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Núi Đọi (NUI_DOI), ruộng (RUONG) chân núi; núi Bàn Hải (BAN_HAI); Hoa Lư (HOA_LU) tây nam.
// Hoạt cảnh trong từng phân cảnh: đoàn người (son) từ Hoa Lư theo đường về núi Đọi; ruộng đồng yên ả; theo thanh kéo, đốm vàng (vua) cùng người (son) cày từng luống dưới chân núi, để lại vệt; cuối cùng một đốm vàng (hũ vàng) lóe lên; đốm bạc (hũ bạc) lóe ở núi Bàn Hải; rồi nhiều đốm vàng (các triều sau làm lễ) lần lượt sáng thành hàng; hội tịch điền: người (son) đông vui quanh ruộng; ba, năm, bảy, chín đốm vàng (số sá cày)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "hoa-binh": { ...shot([-150, 0, -100], 50, 260, 130, 1), mood: MOOD.day },
    "cay-ruong": { ...shot([RUONG[0], 0, RUONG[1]], 90, 180, 70, -1), mood: MOOD.dawn + 0.5 },
    "le-tich-dien": { ...shot([RUONG[0], 0, RUONG[1]], 70, 230, 110, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([RUONG[0], 0, RUONG[1]], 100, 200, 80, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
