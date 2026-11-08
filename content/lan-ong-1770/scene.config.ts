import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HUONG_SON } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hương Sơn (HUONG_SON) tây nam, kinh đô (KINH) đông bắc, Hải Dương (HAI_DUONG) đông.
// Hoạt cảnh trong từng phân cảnh: một đoàn quân (son) hành quân qua đồng; một đốm ngà rời đoàn đi về Hương Sơn; những vòng đốm vàng lan dần ra quanh Hương Sơn theo thanh kéo (tiếng thầy thuốc lan khắp vùng); người (son) từ các làng tìm đến; đốm ngà đi từ Hương Sơn ra kinh đô, đốm vàng ở kinh đô sáng lên, rồi đốm ngà trở về Hương Sơn; hai mươi tám đốm vàng nhỏ (hai mươi tám tập sách) sáng dần ở Hương Sơn; học trò (son) tụ lại
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [330,170,-320], look: [-40,0,60], mood: MOOD.dawn + 0.3 },
    "be-ten": { ...shot([100, 0, 80], 80, 330, 160, 1), mood: MOOD.overcast + 0.3 },
    "huong-son": { ...shot([HUONG_SON[0], 0, HUONG_SON[1]], 150, 240, 120, -1), mood: MOOD.sunset + 0.5 },
    "thuong-kinh": { ...shot([80, 0, 120], 60, 360, 190, 1), mood: MOOD.day },
    "ve-sau": { ...shot([HUONG_SON[0], 0, HUONG_SON[1]], 130, 200, 100, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
