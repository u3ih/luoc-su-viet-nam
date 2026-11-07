import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { AN_VINH, HOANG_SA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đất liền phía tây, đảo Lý Sơn (AN_VINH) ngoài khơi, quần đảo Hoàng Sa (HOANG_SA) phía đông. Khoảng cách thu ngắn rất nhiều (thật là ba ngày ba đêm đi thuyền).
// Hoạt cảnh trong từng phân cảnh: người (son) tụ về An Vĩnh trên đảo Lý Sơn, đốm vàng sáng ở An Vĩnh, năm chấm ngà (thuyền câu) dàn ở bờ; năm chấm ngà (thuyền câu) rời Lý Sơn ra khơi về phía Hoàng Sa theo thanh kéo, các đảo Hoàng Sa sáng dần (vàng); một chấm bị gió dạt lên phía bắc; các chấm ngà (thuyền) đi vòng quanh các đảo Hoàng Sa (đo đạc thủy trình), đốm vàng ở từng đảo sáng dần; một chấm tách ra xa rồi mờ; sáu chấm ngà (thuyền) đến các đảo; mười đốm vàng nhỏ (mười bài gỗ làm dấu mốc) lần lượt sáng lên trên các đảo; người (son) tụ về An Vĩnh, lửa bật dần quanh chỗ làm lễ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,160,-300], look: [60,0,40], mood: MOOD.dawn + 0.3 },
    "bay-muoi": { ...shot([AN_VINH[0], 0, AN_VINH[1]], 60, 230, 110, 1), mood: MOOD.day },
    "ra-khoi": { ...shot([80, 0, 30], 60, 380, 190, -1), mood: MOOD.day },
    "quang-anh": { ...shot([HOANG_SA[0], 0, HOANG_SA[1]], 45, 260, 120, 1), mood: MOOD.overcast + 0.3 },
    "huu-nhat": { ...shot([HOANG_SA[0], 0, HOANG_SA[1]], 70, 230, 100, -1), mood: MOOD.day },
    "khao-le": { ...shot([AN_VINH[0], 0, AN_VINH[1]], 70, 230, 110, 1), mood: MOOD.sunset + 0.3 },
  },
};

export default config;
