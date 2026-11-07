import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { BINH_THAN, CUA_LUC, VAN_DON, GIUA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đất liền phía bắc, biển và đảo phía nam; Cửa Lục (CUA_LUC) phía tây, Vân Đồn (VAN_DON) giữa vùng đảo, Ngọc Sơn (NGOC_SON) đông bắc, Bình Than (BINH_THAN) trên sông. Đường thuyền là diễn hoạ.
// Hoạt cảnh trong từng phân cảnh: một chấm ngà (thuyền than) xuôi sông về bến Bình Than, đốm vàng (thuyền vua) sáng dần ở bến; đoàn chiến thuyền (xanh nhạt) từ phía đông bắc vượt biển vào vùng đảo, đoàn thuyền lương (xanh nhạt) theo chậm phía sau; thuyền nhà Trần (ngà) chặn đánh ở Vân Đồn, lửa bật lên; đoàn chiến thuyền (xanh nhạt) vượt lên phía tây, bỏ đoàn thuyền lương lại phía sau; đoàn thuyền lương (xanh nhạt) đi vào giữa các đảo về Cửa Lục; thuyền nhà Trần (ngà) từ các đảo khép vòng theo thanh kéo, lửa bùng trên đoàn thuyền lương; các đốm vàng (lương chìm) mờ dần giữa vùng đảo; đoàn chiến thuyền (xanh nhạt) quay về phía tây; thuyền nhà Trần (ngà) đứng ở Cửa Lục
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,170,-330], look: [40,0,60], mood: MOOD.dawn + 0.3 },
    "ban-than": { ...shot([BINH_THAN[0], 0, BINH_THAN[1]], 80, 220, 110, 1), mood: MOOD.day },
    "thuyen-luong": { ...shot([VAN_DON[0], 0, VAN_DON[1]], 70, 320, 160, -1), mood: MOOD.overcast + 0.3 },
    "thua-tran": { ...shot([GIUA[0], 0, GIUA[1]], 75, 330, 160, 1), mood: MOOD.overcast + 0.6 },
    "danh-up": { ...shot([-110, 0, 100], 65, 300, 140, -1), mood: MOOD.sunset + 0.3 },
    "ve-sau": { ...shot([CUA_LUC[0], 0, CUA_LUC[1]], 85, 280, 130, 1), mood: MOOD.sunset + 0.3 },
  },
};

export default config;
