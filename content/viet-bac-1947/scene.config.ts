import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Bắc Kạn (BAC_KAN) giữa; Chợ Đồn (CHO_DON) tây; Đoan Hùng (DOAN_HUNG) tây nam; Bông Lau (BONG_LAU) đông; ATK nam.
// Hoạt cảnh trong từng phân cảnh: đoàn người (son) gùi máy móc từ miền xuôi lên rừng; các lán (đốm ngà) sáng trong An toàn khu; theo thanh kéo, lính dù (đốm xanh nhạt) từ trên cao rơi xuống Bắc Kạn; cơ quan (ngà) tản vào rừng; đoàn tàu (chấm xanh nhạt) ngược sông Lô; pháo bên bờ phục kích (lửa ở Đoan Hùng); trên đường số 4, đoàn xe (xanh nhạt) vào đèo Bông Lau; các cánh quân Pháp (xanh nhạt) rút khỏi Bắc Kạn về phía nam và đông; các lán (đốm ngà) sáng lại
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "atk": { ...shot([40, 0, -140], 80, 180, 90, 1), mood: MOOD.dawn + 0.5 },
    "nhay-du": { ...shot([20, 0, 60], 90, 190, 70, -1), mood: MOOD.day },
    "song-lo": { ...shot([-200, 0, -60], 70, 170, 80, 1), mood: MOOD.sunset + 0.6 },
    "rut-lui": { ...shot([40, 0, 40], 75, 260, 150, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
