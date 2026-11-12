import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đảo Cát Bà (CAT_BA) giữa; Cát Ông (CAT_ONG) đông; biển bao quanh.
// Hoạt cảnh trong từng phân cảnh: đốm ngà (Các Bà) sáng trên đảo lớn, đốm vàng (Các Ông) ở đảo bên cạnh; thuyền (chấm ngà) qua lại hai đảo; theo thanh kéo, các vùng sinh thái lần lượt sáng: rừng trên đảo (đốm xanh lá), rừng ngập mặn ven bờ (đốm ngà), rạn san hô ngoài khơi (đốm xanh nhạt); vài đốm vàng (voọc Cát Bà) di chuyển trên vách núi đá của đảo lớn; toàn quần đảo bừng sáng (đốm vàng trên mọi hòn đảo) — di sản thiên nhiên thế giới cùng vịnh Hạ Long
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "dao-ngoc": { ...shot([60, 0, 20], 80, 270, 150, 1), mood: MOOD.dawn + 0.5 },
    "sinh-quyen": { ...shot([0, 0, 0], 85, 260, 160, -1), mood: MOOD.sunset + 0.6 },
    "vooc": { ...shot([0, 0, 0], 75, 230, 150, 1), mood: MOOD.sunset + 0.65 },
    "di-san": { ...shot([20, 0, 20], 80, 270, 160, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
