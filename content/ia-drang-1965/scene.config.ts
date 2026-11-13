import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Chư Pông (CHU_PONG) tây nam; X-Ray (X_RAY) giữa; Albany (ALBANY) bắc; Plei Me (PLEI_ME) đông.
// Hoạt cảnh trong từng phân cảnh: các trung đoàn (son) vây trại Plei Me (đốm xanh nhạt); đoàn quân cứu viện (ngà) từ phía đông bị chặn giữa đường; theo thanh kéo, trực thăng (đốm xanh nhạt, cách điệu) đổ quân xuống bãi đáp X-Ray; các mũi quân (son) từ sườn núi đánh xuống; lửa quanh bãi đáp; đoàn quân (xanh nhạt) hành quân bộ từ X-Ray lên Albany; giữa rừng, các nhóm (son) áp sát hai bên sườn đội hình; hai bên rời trận địa: các nhóm (son) rút về núi Chư Pông; trực thăng (đốm xanh nhạt) đưa quân đi; đốm vàng nhỏ ở thung lũng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "plei-me": { ...shot([140, 0, -70], 120, 180, 90, 1), mood: MOOD.overcast + 0.6 },
    "x-ray": { ...shot([-40, 0, -20], 180, 190, 80, -1), mood: MOOD.sunset + 0.65 },
    "albany": { ...shot([0, 0, 60], 80, 180, 100, 1), mood: MOOD.dawn + 0.6 },
    "ca-hai": { ...shot([-20, 0, 30], 100, 240, 140, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
