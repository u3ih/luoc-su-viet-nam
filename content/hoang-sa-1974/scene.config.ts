import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Nhóm Lưỡi Liềm (LUOI_LIEM) giữa; nhóm An Vĩnh (AN_VINH) đông bắc.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (đài khí tượng) trên một đảo nhóm Lưỡi Liềm; đốm xanh nhạt ở nhóm An Vĩnh phía đông bắc; tàu cá (xanh nhạt) tới gần các đảo; bốn chiến hạm (ngà) lần lượt tới; những đốm nhỏ (cờ) xuất hiện rồi bị nhổ trên các đảo; theo thanh kéo, các chiến hạm (ngà) và tàu (xanh nhạt) tiến vào vùng nước giữa nhóm đảo; một tàu bốc cháy rồi tắt (Nhật Tảo); các đốm xanh nhạt sáng trên tất cả các đảo; vòng đốm vàng nhỏ trên mặt nước (tưởng niệm những người tử trận)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "hai-nhom-dao": { ...shot([60, 0, 60], 50, 280, 150, 1), mood: MOOD.day },
    "cang-thang": { ...shot([10, 0, 10], 70, 200, 100, -1), mood: MOOD.overcast + 0.6 },
    "ngay-19-1": { ...shot([20, 0, 0], 100, 190, 90, 1), mood: MOOD.dawn + 0.6 },
    "sau-1974": { ...shot([10, 0, 10], 90, 220, 120, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
