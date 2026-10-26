import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { BAN_SON, DONG_DA, HA_HOI, NGOC_HOI, TAM_DIEP, THANG_LONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Trục chính chạy bắc–nam: Thăng Long (THANG_LONG) ở phía bắc, các đồn Ngọc Hồi (NGOC_HOI), Hà Hồi (HA_HOI),
// Khương Thượng / Đống Đa (DONG_DA) dọc đường phía nam thành, núi đá vôi quanh Tam Điệp (TAM_DIEP), núi Bân (BAN_SON) ở phía nam xa; sông lớn ở phía đông.
// Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (quân từ phía bắc vào Thăng Long, người tụ về núi Bân rồi đoàn quân ra Bắc, quân ăn Tết rồi lên đường, đêm tiến sát
// đồn Hà Hồi và Khương Thượng, tiến đánh Ngọc Hồi và Đống Đa, vào Thăng Long) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Máy quay thường đứng phía nam nhìn lên bắc để đoàn quân tiến lên màn hình.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-300, 180, -250], look: [40, 5, 150], mood: MOOD.dawn + 0.3 },
    "cau-vien": { ...shot([THANG_LONG[0] - 10, 3, THANG_LONG[1] + 20], 90, 250, 150, 1), mood: MOOD.overcast + 0.3 },
    "len-ngoi": { ...shot([BAN_SON[0], 20, BAN_SON[1] + 20], 100, 200, 110, -1), mood: MOOD.dawn + 0.8 },
    "tam-diep": { ...shot([-20, 0, -40], 90, 340, 210, 1, 0.2), mood: MOOD.sunset + 0.4 },
    "ha-hoi": { ...shot([(HA_HOI[0] + DONG_DA[0]) / 2, 2, 110], 90, 330, 180, -1, 0.25), mood: MOOD.night - 0.2 },
    "ngoc-hoi": { ...shot([NGOC_HOI[0] - 20, 3, 180], 90, 280, 150, 1, 0.2), mood: MOOD.dawn + 0.5 },
    "thang-long": { ...shot([THANG_LONG[0] - 10, 3, THANG_LONG[1] - 30], 100, 260, 140, -1), mood: MOOD.day },
  },
};

export default config;
