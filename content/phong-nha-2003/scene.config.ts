import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Son từ đông vào cửa động (CUA_DONG) dưới khối núi (KE_BANG); động Tiên Sơn (TIEN_SON) trên sườn.
// Hoạt cảnh trong từng phân cảnh: thuyền nhỏ (chấm ngà) trên sông Son giữa vùng núi đá vôi; theo thanh kéo, thuyền (son) ngược sông Son vào cửa động; văn tự Chăm (đốm ngà) sáng trên vách cửa động; đoàn thám hiểm (chấm ngà) lên động Tiên Sơn; đốm vàng lần lượt sáng dọc lòng động (7.729 m) vào khối núi; đốm vàng lớn (di sản thế giới) trên vùng núi; các cửa động (đốm vàng) quanh khối núi
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [330,160,-300], look: [-60,0,20], mood: MOOD.dawn + 0.3 },
    "da-voi": { ...shot([-60, 0, 60], 120, 360, 200, 1), mood: MOOD.dawn + 0.5 },
    "dong-phong-nha": { ...shot([40, 0, -10], 170, 220, 70, -1), mood: MOOD.sunset + 0.6 },
    "tham-hiem": { ...shot([-60, 0, 30], 160, 230, 100, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([0, 0, 0], 150, 330, 170, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
