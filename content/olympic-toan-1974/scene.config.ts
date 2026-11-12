import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Khoảng trống (SAN) giữa.
// Hoạt cảnh trong từng phân cảnh: đội tuyển đầu tiên (chấm ngà) đi vào phòng thi; các đề bài (đốm xanh nhạt) sáng; theo thanh kéo, các bước lời giải (cột đốm vàng) lần lượt sáng; cuối cùng một đốm lớn (giải đặc biệt); mười đốm vàng (mười bài điểm tuyệt đối) lần lượt sáng theo vòng cung; ba cột đốm (các kỳ đứng thứ ba: vàng) và hàng chấm (đội tuyển các năm) đi qua
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "bat-dau": { ...shot([-40, 0, -20], 80, 220, 110, 1), mood: MOOD.dawn + 0.5 },
    "giai-dac-biet": { ...shot([0, 0, 0], 85, 180, 100, -1), mood: MOOD.sunset + 0.75 },
    "diem-tuyet-doi": { ...shot([0, 0, 20], 80, 220, 120, 1), mood: MOOD.sunset + 0.7 },
    "thanh-tich": { ...shot([0, 0, 0], 80, 220, 110, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
