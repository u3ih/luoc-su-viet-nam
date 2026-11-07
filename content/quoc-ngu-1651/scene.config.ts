import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển phía đông; cảng (CANG) ở cửa sông, dinh (DINH) và các làng (LANG, XOM) bên trong; XA là hướng ra biển xa.
// Hoạt cảnh trong từng phân cảnh: vài chấm xanh nhạt (giáo sĩ) theo đường biển vào cảng rồi lên dinh; người (son) ở dinh tụ lại, đốm ngà sáng dần; các chấm xanh nhạt tỏa về nhiều làng, người (son) ở mỗi làng đến gặp; đốm ngà (ghi chép) sáng dần ở từng nơi; một chấm ngà (những trang ghi chép) rời cảng theo đường biển ra xa phía đông nam theo thanh kéo, các đốm vàng sáng dần dọc đường biển; đốm vàng sáng dần ở dinh và các làng (từ điển, chữ viết được chỉnh lý); người (son) đi lại giữa các làng; người (son) từ khắp nơi đổ về các làng và cảng, đốm vàng sáng khắp vùng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,170,-300], look: [80,0,40], mood: MOOD.dawn + 0.3 },
    "hoc-tieng": { ...shot([100, 0, 60], 70, 260, 120, 1), mood: MOOD.day },
    "nhieu-nguoi": { ...shot([-40, 0, 10], 80, 320, 150, -1), mood: MOOD.day },
    "in-roma": { ...shot([290, 0, -150], 10, 330, 150, 1), mood: MOOD.sunset + 0.7 },
    "chinh-ly": { ...shot([-40, 0, 10], 70, 320, 150, -1), mood: MOOD.overcast + 0.4 },
    "pho-bien": { ...shot([0, 0, 20], 80, 380, 190, 1), mood: MOOD.sunset + 0.3 },
  },
};

export default config;
