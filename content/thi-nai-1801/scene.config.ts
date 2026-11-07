import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { DAM } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển phía đông, đầm (DAM) ở giữa, cửa đầm (CUA); Tam Tòa (TAM_TOA) bắc cửa, Nhạn Châu (NHAN_CHAU) nam cửa; thành Bình Định (THANH_BD) phía tây; NGOAI ngoài cửa biển.
// Hoạt cảnh trong từng phân cảnh: các đốm vàng sáng dần quanh bờ đầm, vài chấm ngà (thuyền nhỏ) đi trong đầm; quân vây (son) quanh thành Bình Định, đốm ngà giữ thành; thuyền Tây Sơn (xanh nhạt) đậu trong đầm chặn cửa, lửa bảo Tam Tòa, Nhạn Châu; thuyền Nguyễn (ngà) đậu ngoài cửa; thuyền nhỏ (ngà) lẻn vào Hổ Cơ, rồi đoàn thuyền Nguyễn (ngà) từ ngoài cửa tiến vào đầm theo thanh kéo; lửa bùng dần trên thuyền Tây Sơn (xanh nhạt) đậu trong đầm; trời rạng, lửa còn âm ỉ trong đầm; đốm vàng nhạt mờ dần trên mặt nước; đoàn thuyền Nguyễn (ngà) rời cửa Thị Nại đi lên phía bắc; đốm ngà ở thành Bình Định
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,170,-300], look: [80,0,20], mood: MOOD.dawn + 0.3 },
    "dam": { ...shot([DAM[0], 0, DAM[1]], 75, 330, 160, 1), mood: MOOD.day },
    "vay-thanh": { ...shot([-60, 0, -40], 60, 320, 150, -1), mood: MOOD.overcast + 0.4 },
    "hoa-cong": { ...shot([170, 0, 5], 80, 280, 120, 1), mood: MOOD.sunset + 0.75 },
    "thiet-hai": { ...shot([120, 0, 10], 70, 290, 130, -1), mood: MOOD.dawn + 0.4 },
    "ve-sau": { ...shot([260, 0, 60], 75, 330, 150, 1), mood: MOOD.day },
  },
};

export default config;
