import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { LUY } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển phía đông; sông Gianh (SONG_GIANH) bắc, cửa Nhật Lệ (NHAT_LE) nam; lũy Trấn Ninh (LUY) ngang giữa, Đâu Mâu (DAU_MAU), Đồng Hới (DONG_HOI). Màu: xanh nhạt = quân Tây Sơn, ngà = quân Nguyễn (chỉ để phân biệt).
// Hoạt cảnh trong từng phân cảnh: quân Tây Sơn (xanh nhạt) từ phía bắc vượt sông Gianh vào; thuyền Tây Sơn (xanh nhạt) theo bờ biển xuống cửa Nhật Lệ; ba cánh quân Tây Sơn (xanh nhạt) chia về lũy Trấn Ninh, thành Đâu Mâu và cửa sông Gianh; quân Nguyễn (ngà) giữ sông Gianh lui về Đồng Hới; theo thanh kéo (sáng → chiều tối): quân Nguyễn (ngà) giữ dọc lũy; quân Tây Sơn (xanh nhạt) dồn lên, một đốm vàng đi trước đốc quân; lửa bùng dần dọc lũy; ở cửa Nhật Lệ, thuyền Nguyễn (ngà) đánh tan thuyền Tây Sơn, lửa bùng; quân Tây Sơn (xanh nhạt) rút lên phía bắc
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [40,0,60], mood: MOOD.dawn + 0.3 },
    "vuot-song": { ...shot([40, 0, 180], 90, 300, 150, 1), mood: MOOD.overcast + 0.3 },
    "ba-mui": { ...shot([0, 0, 80], 80, 330, 170, -1), mood: MOOD.day },
    "luy-tran-ninh": { ...shot([LUY[0], 0, LUY[1]], 90, 230, 100, 1), mood: MOOD.sunset + 0.4 },
    "nhat-le": { ...shot([160, 0, -60], 60, 300, 140, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
