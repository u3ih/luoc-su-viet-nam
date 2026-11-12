import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sài Gòn (SAI_GON) nam; Huế (HUE) giữa; Hà Nội (HA_NOI), Nam Định (NAM_DINH), Hải Phòng (HAI_PHONG) bắc.
// Hoạt cảnh trong từng phân cảnh: những đốm ngà nhỏ rời rạc (các bài hát đầu tiên) lần lượt sáng ở Hà Nội, Hải Phòng, Nam Định; một đốm vàng (Nguyễn Văn Tuyên) đi từ Sài Gòn ra Huế, Hà Nội, Hải Phòng, Nam Định; theo thanh kéo, các vòng đốm vàng (tiếng hát) lan dần từ sân khấu ra khắp khán phòng (son); đốm vàng sáng khắp các thành phố (bản nhạc bán ở hiệu sách); người yêu nhạc (son) tụ quanh
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "chuan-bi": { ...shot([20, 0, 200], 80, 220, 120, 1), mood: MOOD.sunset + 0.55 },
    "nguyen-van-tuyen": { ...shot([50, 0, -20], 85, 270, 170, -1), mood: MOOD.sunset + 0.6 },
    "hoi-tri-tri": { ...shot([-60, 0, 230], 80, 170, 70, 1), mood: MOOD.sunset + 0.75 },
    "tien-chien": { ...shot([30, 0, 100], 80, 270, 160, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
