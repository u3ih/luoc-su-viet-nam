import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Trung tâm (TRUNG_TAM) giữa; Khâm Thiên (KHAM_THIEN) tây nam; Bạch Mai (BACH_MAI) nam; trận địa (TRAN_DIA) quanh.
// Hoạt cảnh trong từng phân cảnh: hai đốm (son và xanh nhạt) tiến lại gần nhau trên cao giữa thành phố rồi tắt (đàm phán đổ vỡ); theo thanh kéo, các tốp máy bay (đốm xanh nhạt, cách điệu) bay ngang trên cao; các cột đốm son (tên lửa) vút lên từ trận địa; lửa trên mặt đất; lửa dọc dãy phố Khâm Thiên và ở bệnh viện Bạch Mai; các đốm ngà (nhà dân) tắt; thành phố yên lại; hai đốm (son, xanh nhạt) lại gặp nhau, đốm vàng sáng (hiệp định)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "ban-dam-phan": { ...shot([0, 0, 0], 90, 200, 100, 1), mood: MOOD.sunset + 0.6 },
    "b52": { ...shot([0, 0, 0], 60, 260, 150, -1), mood: MOOD.sunset + 0.9 },
    "kham-thien": { ...shot([-20, 0, -60], 80, 170, 80, 1), mood: MOOD.sunset + 0.85 },
    "tro-lai-paris": { ...shot([0, 0, 0], 120, 220, 120, -1), mood: MOOD.dawn + 0.5 },
  },
};

export default config;
