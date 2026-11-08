import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { PHU_DONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Làng Phù Đổng (PHU_DONG); núi Trâu Sơn (TRAU_SON); núi Sóc (SOC_SON) bắc; kinh (KINH) tây.
// Hoạt cảnh trong từng phân cảnh: ba đốm ngà (ba sách chép truyện) sáng trên làng; chấm sáng (sứ giả) từ kinh đô tới làng; theo thanh kéo, cột đốm ngà (cậu bé) lớn vụt lên; dân làng (son) mang cơm tới; cuối cùng đốm vàng (Gióng) phi về phía núi Trâu Sơn; giặc (xanh nhạt) tan chạy ở chân núi Trâu Sơn; đốm vàng (Gióng) đuổi tới núi Sóc rồi bay lên trời và lịm; hội Gióng: đoàn rước (son, 120 phù giá) quanh đền; 28 chấm xanh nhạt (vai tướng giặc); đốm vàng (cờ lệnh)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "sach-chep": { ...shot([PHU_DONG[0], 0, PHU_DONG[1]], 80, 220, 100, 1), mood: MOOD.dawn + 0.5 },
    "vuon-vai": { ...shot([PHU_DONG[0], 0, PHU_DONG[1]], 70, 180, 80, -1), mood: MOOD.sunset + 0.5 },
    "ve-troi": { ...shot([60, 0, 160], 80, 330, 190, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([PHU_DONG[0], 0, PHU_DONG[1]], 80, 180, 80, -1), mood: MOOD.day },
  },
};

export default config;
