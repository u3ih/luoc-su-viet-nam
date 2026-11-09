import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Dã Năng (DA_NANG) tây; Ô Diên (O_DIEN); Quân Thần (QUAN_THAN); Long Biên (LONG_BIEN) đông; Cổ Loa (CO_LOA).
// Hoạt cảnh trong từng phân cảnh: đoàn người (son) rút vào núi phía tây, đắp thành ở động Dã Năng (đốm vàng); quân Lý Phật Tử (son) từ tây và quân Triệu Việt Vương (ngà) từ đông giáp nhau ở bãi Quân Thần; đốm vàng (chia đất); theo thanh kéo, quân Lý Phật Tử (son) từ Ô Diên kéo về Long Biên; Triệu Việt Vương (đốm ngà) chạy về phía nam; quân Tuỳ (xanh nhạt) từ phía bắc kéo xuống; các thành Long Biên, Ô Diên, Cổ Loa (đốm son) lần lượt tắt
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "da-nang": { ...shot([-220, 0, 180], 70, 230, 120, 1), mood: MOOD.dawn + 0.5 },
    "quan-than": { ...shot([20, 0, 120], 80, 260, 130, -1), mood: MOOD.sunset + 0.55 },
    "danh-up": { ...shot([40, 0, 40], 80, 320, 170, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([100, 0, 150], 70, 320, 170, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
