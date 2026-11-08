import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HO } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hồ (HO) ở giữa, vòng hồ ngoài là diễn hoạ; cấm thành (CAM_THANH) ở phía đông.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (tòa sen trong mộng) hiện dần trên mặt hồ, đốm ngà (vua) ở cấm thành; các nhà sư (son) đi vòng quanh hồ tụng kinh theo thanh kéo, đốm vàng giữa hồ sáng dần; vòng hành lang sáng dần (vàng) quanh hồ Linh Chiểu, bốn cây cầu qua hồ Bích Trì sáng lên (ngà); ánh cam bùng lên giữa hồ rồi tắt (chùa bị phá năm 1954), sau đó đốm vàng sáng lại; người (son) đến dựng lại
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-220,120,-230], look: [0,0,0], mood: MOOD.dawn + 0.3 },
    "giac-mong": { ...shot([HO[0], 0, HO[1]], 60, 200, 80, 1), mood: MOOD.sunset + 0.7 },
    "dung-chua": { ...shot([HO[0], 0, HO[1]], 80, 190, 80, -1), mood: MOOD.sunset + 0.4 },
    "sua-chua": { ...shot([HO[0], 0, HO[1]], 100, 210, 90, 1), mood: MOOD.day },
    "dung-lai": { ...shot([HO[0], 0, HO[1]], 70, 200, 80, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
