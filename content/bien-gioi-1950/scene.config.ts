import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Cao Bằng (CAO_BANG) tây bắc; Đông Khê (DONG_KHE) giữa; Cốc Xá (COC_XA) tây; Thất Khê (THAT_KHE), Lạng Sơn (LANG_SON) đông nam.
// Hoạt cảnh trong từng phân cảnh: chuỗi đồn (đốm xanh nhạt) dọc đường số 4 từ Lạng Sơn lên Cao Bằng; các đơn vị (son) hành quân qua rừng; theo thanh kéo, các đơn vị (son) khép vòng quanh đồn Đông Khê (đốm xanh nhạt); hai cánh quân Pháp (xanh nhạt) từ Cao Bằng và Thất Khê tiến dọc đường, dạt vào hẻm núi Cốc Xá, bị chặn (son); các đồn (đốm xanh nhạt) từ Thất Khê đến Lạng Sơn lần lượt tắt; dọc biên giới (đốm vàng) sáng lên
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "duong-so-4": { ...shot([20, 0, 20], 60, 280, 160, 1), mood: MOOD.dawn + 0.5 },
    "dong-khe": { ...shot([-30, 0, 40], 80, 170, 90, -1), mood: MOOD.sunset + 0.6 },
    "coc-xa": { ...shot([-90, 0, 70], 70, 180, 100, 1), mood: MOOD.sunset + 0.65 },
    "khai-thong": { ...shot([140, 0, -60], 60, 230, 130, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
