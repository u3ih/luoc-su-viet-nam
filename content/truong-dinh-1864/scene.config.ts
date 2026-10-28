import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { DAM_LA, GO_CONG, SAI_GON } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông chảy từ Sài Gòn (SAI_GON, phía bắc) xuống biển ở đông nam; Gò Công (GO_CONG) và "Đám lá tối trời" (DAM_LA)
// ở vùng rạch phía nam; ba điểm gợi ý ba tỉnh (BA_TINH); hướng Huế (NORTH) ở góc tây bắc. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (sứ giả tới bến sông, quân tản ra ba điểm; lệnh từ phía bắc đi tới rồi mờ đi; nghĩa quân tụ về Gò Công; quân Pháp tiến vào vùng
// rạch; đèn tưởng niệm) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330, 200, -330], look: [30, 0, 0], mood: MOOD.dawn + 0.3 },
    "hoa-uoc": { ...shot([SAI_GON[0] - 30, 0, SAI_GON[1] - 30], 90, 240, 120, 1), mood: MOOD.overcast + 0.3 },
    "bai-binh": { ...shot([20, 0, -100], 90, 260, 150, -1), mood: MOOD.sunset - 0.2 },
    "go-cong": { ...shot([GO_CONG[0], 0, GO_CONG[1]], 45, 220, 100, 1), mood: MOOD.day },
    "dam-la": { ...shot([DAM_LA[0], 0, DAM_LA[1]], 315, 230, 100, -1), mood: MOOD.dawn + 0.8 },
    "tuong-nho": { ...shot([GO_CONG[0], 0, GO_CONG[1]], 135, 220, 90, 1), mood: MOOD.night - 0.2 },
  },
};

export default config;
