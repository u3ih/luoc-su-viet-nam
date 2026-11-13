import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hoà Bình (HOA_BINH) giữa; Tu Vũ (TU_VU) đông bắc; Pheo (PHEO) bắc; Xuân Mai (XUAN_MAI) đông nam, đường số 6.
// Hoạt cảnh trong từng phân cảnh: đốm xanh nhạt (lính dù) rơi xuống thị xã; đoàn quân (xanh nhạt) theo đường số 6 và sông Đà tiến lên; đêm, các mũi quân (son) từ bốn phía đánh vào cứ điểm Tu Vũ; lửa bùng; ca nô (xanh nhạt) trên sông bị chặn; theo thanh kéo, đoàn xe tiếp tế (xanh nhạt) đi lên đường số 6; hai bên đèo (son) chặn đánh, lửa bùng dọc đường; quân Pháp (xanh nhạt) rời thị xã, vượt sông Đà rồi theo đường số 6 về phía đông; lửa ở bến sông
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "nhay-du": { ...shot([-20, 0, 20], 60, 200, 110, 1), mood: MOOD.overcast + 0.6 },
    "tu-vu": { ...shot([110, 0, 140], 70, 170, 80, -1), mood: MOOD.sunset + 0.75 },
    "duong-so-6": { ...shot([100, 0, -60], 150, 210, 100, 1), mood: MOOD.sunset + 0.65 },
    "rut-lui": { ...shot([20, 0, 40], 90, 220, 110, -1), mood: MOOD.dawn + 0.6 },
  },
};

export default config;
