import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Dải đất chữ S; kinh đô Huế (HUE) giữa; biển đông; núi tây.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (vua mới) sáng ở kinh đô; triều thần (chấm ngà) tụ về; Nội các, Cơ mật viện (hai đốm ngà) sáng cạnh đốm vàng; các quan (chấm ngà) xếp hàng theo phẩm trật; theo thanh kéo, ba mươi tỉnh (đốm vàng) lần lượt sáng dọc dải đất từ bắc vào nam; quan lại (chấm ngà) từ kinh đô toả đi; các tỉnh (đốm vàng) sáng đều; dân (son) khẩn hoang ra vùng ven biển
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "len-ngoi": { ...shot([30, 0, 0], 80, 230, 120, 1), mood: MOOD.dawn + 0.5 },
    "trieu-dinh": { ...shot([30, 0, 0], 85, 190, 90, -1), mood: MOOD.sunset + 0.55 },
    "lap-tinh": { ...shot([-20, 0, 0], 0, 340, 300, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([-20, 0, 0], 5, 330, 250, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
