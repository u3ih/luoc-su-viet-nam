import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { PHIEN_TRAN, CHAN_LAP, SAM_GIANG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đất thấp, sông lớn chảy từ đông bắc xuống tây nam; biển ở phía nam; Phiên Trấn (PHIEN_TRAN) bên sông; Trấn Biên (TRAN_BIEN) ở đông bắc; Sầm Giang (SAM_GIANG) ở phía nam; Chân Lạp (CHAN_LAP) ở phía tây. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: đoàn ngà từ phía bắc đi vào vùng Đồng Nai, một đốm ngà sáng ở Phiên Trấn; bốn đốm vàng (hai huyện, hai dinh) sáng dần theo thanh kéo; các nhóm người (son) từ phía bắc đi vào ở; đoàn ngà đi từ Phiên Trấn sang phía tây; đốm xanh nhạt ở phía tây mờ dần khi đoàn tới; đốm vàng dịu ở Sầm Giang, các nhóm người (son) đến đứng lặng, lửa bật dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [330,190,330], look: [20,0,60], mood: MOOD.dawn + 0.3 },
    "nam-tien": { ...shot([PHIEN_TRAN[0], 0, PHIEN_TRAN[1]], 90, 210, 110, 1), mood: MOOD.day },
    "lap-phu": { ...shot([PHIEN_TRAN[0], 0, PHIEN_TRAN[1]], 130, 300, 180, -1), mood: MOOD.dawn + 0.9 },
    "chan-lap": { ...shot([CHAN_LAP[0], 0, CHAN_LAP[1]], 20, 230, 120, 1), mood: MOOD.sunset - 0.2 },
    "ve-sau": { ...shot([SAM_GIANG[0], 0, SAM_GIANG[1]], 270, 200, 110, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
