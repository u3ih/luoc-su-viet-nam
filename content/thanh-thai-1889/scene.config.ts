import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh thành (KINH_THANH) bờ bắc sông Hương; Quốc học, Đông Ba, Tràng Tiền quanh đó.
// Hoạt cảnh trong từng phân cảnh: triều thần (ngà) tụ về giữa kinh thành; đốm vàng (vua mới) sáng lên; theo thanh kéo, nhà vua (đốm vàng) rời Đại Nội đi vi hành; dân (son) tụ quanh; các công trình mới (đốm ngà) sáng lên; quan Pháp (xanh nhạt) vào kinh thành; đốm vàng lịm dần; tàu (đốm ngà) đưa cựu hoàng ra biển, đi rất xa
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "len-ngoi": { ...shot([-20, 0, 100], 80, 280, 160, 1), mood: MOOD.dawn + 0.5 },
    "gan-dan": { ...shot([40, 0, 20], 80, 280, 150, -1), mood: MOOD.sunset + 0.6 },
    "thoai-vi": { ...shot([-20, 0, 100], 70, 260, 150, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([200, 0, 40], 40, 300, 170, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
