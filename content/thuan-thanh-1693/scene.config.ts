import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Panduranga (PANDURANGA) giữa; làng Chăm (LANG_CHAM) quanh; Huế (HUE_P) bắc.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (kinh đô Panduranga); các làng Chăm (đốm ngà); thuyền buôn (ngà) ra biển nối với thế giới Mã Lai; theo thanh kéo, quân chúa Nguyễn (son) từ phía bắc tiến vào Panduranga; các làng Chăm (ngà) dấy lên, vòng người quanh các làng; đốm ngà (trấn Thuận Thành tự trị) sáng lâu dài; về sau giao tranh (lửa) thời Tây Sơn – Nguyễn Ánh; đốm ngà (vua Chăm) bị đưa về phía bắc (Huế); đốm ngà ở kinh đô tắt; lửa ở các làng (các cuộc nổi dậy bị đàn áp)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "panduranga": { ...shot([20, 0, -20], 90, 190, 100, 1), mood: MOOD.dawn + 0.5 },
    "nam-1693": { ...shot([20, 0, 10], 90, 230, 130, -1), mood: MOOD.sunset + 0.65 },
    "tu-tri": { ...shot([0, 0, 0], 60, 250, 140, 1), mood: MOOD.overcast + 0.6 },
    "nam-1832": { ...shot([30, 0, 60], 80, 220, 120, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
