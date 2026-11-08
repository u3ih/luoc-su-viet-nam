import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { AN_CU } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Nơi ẩn cư (AN_CU) giữa núi; Thanh Tuyền (THANH_TUYEN), Đỗ Tùng (DO_TUNG) đông bắc.
// Hoạt cảnh trong từng phân cảnh: đốm ngà rời huyện Thanh Tuyền, theo đường núi về nơi ẩn cư ở xứ Thanh; hai mươi đốm vàng nhỏ (hai mươi truyện) lần lượt sáng ở nơi ẩn cư theo thanh kéo; những đốm ngà (người đời sau đọc và bình) sáng dần ở nhiều nơi xa; trời rạng; các đốm vàng (truyện) lan theo đường ra đồng bằng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "roi-quan": { ...shot([120, 0, 120], 120, 330, 170, 1), mood: MOOD.overcast + 0.4 },
    "viet-sach": { ...shot([AN_CU[0], 0, AN_CU[1]], 70, 170, 80, -1), mood: MOOD.sunset + 0.7 },
    "danh-gia": { ...shot([0, 0, 0], 80, 360, 190, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([AN_CU[0], 0, AN_CU[1]], 80, 200, 90, -1), mood: MOOD.dawn + 0.4 },
  },
};

export default config;
