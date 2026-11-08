import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { GIA_DINH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Gia Định (GIA_DINH) đông bắc, Cần Giuộc (CAN_GIUOC) đông nam, Ba Tri (BA_TRI) tây nam; DUONG_RA_KINH là hướng ra Huế.
// Hoạt cảnh trong từng phân cảnh: đốm ngà đi từ Gia Định ra kinh rồi trở về; đốm vàng nhỏ ở Gia Định (đỗ Tú tài); đốm ngà (cụ đồ) ở Gia Định; học trò (son) từ khắp nơi tìm đến theo thanh kéo; các đốm vàng lan ra quanh; quân Pháp (xanh nhạt) vào Gia Định; đốm ngà rời Gia Định qua Cần Giuộc về Ba Tri; những đốm vàng (thơ Vân Tiên) lan dần khắp đồng bằng; người (son) tụ về Ba Tri
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [40,0,40], mood: MOOD.dawn + 0.3 },
    "ra-kinh": { ...shot([150, 0, 260], 80, 260, 130, 1), mood: MOOD.overcast + 0.3 },
    "mu-loa": { ...shot([GIA_DINH[0], 0, GIA_DINH[1]], 70, 220, 100, -1), mood: MOOD.sunset + 0.6 },
    "ba-tri": { ...shot([60, 0, 0], 80, 340, 170, 1), mood: MOOD.overcast + 0.4 },
    "ve-sau": { ...shot([-60, 0, -80], 70, 320, 160, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
