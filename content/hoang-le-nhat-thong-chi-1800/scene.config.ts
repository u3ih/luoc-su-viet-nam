import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { TA_THANH_OAI } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Làng Tả Thanh Oai (TA_THANH_OAI), Thăng Long (KINH) phía bắc.
// Hoạt cảnh trong từng phân cảnh: các đốm ngà (người dòng họ Ngô Thì) sáng trong làng Tả Thanh Oai; người làng (son) qua lại; mười bảy đốm vàng (mười bảy hồi) nối nhau thành hàng theo thanh kéo: bảy đốm đầu (ngà), mười đốm sau (vàng); những đốm sáng (người đời đương thời) rải giữa làng và kinh thành; đốm vàng mờ ở kinh thành (biến cố cuối Lê); mười hai đốm ngà nhỏ (mười hai bản chép tay) tỏa ra quanh làng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "ngo-gia": { ...shot([TA_THANH_OAI[0], 0, TA_THANH_OAI[1]], 80, 220, 100, 1), mood: MOOD.day },
    "muoi-bay-hoi": { ...shot([TA_THANH_OAI[0], 0, TA_THANH_OAI[1]], 80, 160, 70, -1), mood: MOOD.sunset + 0.65 },
    "gia-tri": { ...shot([40, 0, 100], 80, 330, 170, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([TA_THANH_OAI[0], 0, TA_THANH_OAI[1]], 70, 180, 80, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
