import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HOI_AN, PHO_NHAT } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông, núi ở phía tây; Hội An (HOI_AN) bên sông gần cửa biển, phố Nhật (PHO_NHAT) bên cạnh, cửa biển (CUA_BIEN) ở phía đông; dinh Quảng Nam (QUANG_NAM_DINH) trong đất liền; Đà Nẵng (DA_NANG) ở phía bắc. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: đốm ngà sáng ở Hội An, các nhóm người (son) từ trong đất liền đi ra cảng, lửa bật dần; các đốm xanh nhạt (thuyền) từ biển vào cửa sông cập bến theo thanh kéo; đốm ngà sáng ở phố Nhật; hai đốm ngà sáng ở Hội An và phố bên cạnh, các nhóm người (son) đi lại giữa hai nơi; đoàn xanh nhạt từ phía bắc xuống tới Hội An, các đốm ngà ở cảng mờ dần; quầng vàng dịu ở Hội An, từng nhóm người (son) đến đứng lặng, đèn quanh cảng bật dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,190,-300], look: [70,0,0], mood: MOOD.dawn + 0.3 },
    "thuong-cang": { ...shot([HOI_AN[0], 0, HOI_AN[1]], 20, 230, 120, 1), mood: MOOD.day },
    "nguoi-nhat": { ...shot([HOI_AN[0], 0, HOI_AN[1]], 20, 230, 110, -1), mood: MOOD.dawn + 0.8 },
    "nguoi-hoa": { ...shot([PHO_NHAT[0], 0, PHO_NHAT[1]], 120, 220, 110, 1), mood: MOOD.sunset - 0.3 },
    "suy-giam": { ...shot([HOI_AN[0], 0, HOI_AN[1]], 100, 240, 130, -1), mood: MOOD.overcast + 0.7 },
    "ngay-nay": { ...shot([HOI_AN[0], 0, HOI_AN[1]], 40, 220, 110, 1), mood: MOOD.sunset - 0.2 },
  },
};

export default config;
