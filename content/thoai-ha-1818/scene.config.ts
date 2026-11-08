import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { NUI_SAP } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Tam Khê (TAM_KHE) đông bắc, Rạch Giá (RACH_GIA) tây nam; núi Sập (NUI_SAP). Tuyến kênh là diễn hoạ.
// Hoạt cảnh trong từng phân cảnh: thuyền (ngà) phải đi vòng đường biển từ Rạch Giá; mùa lũ nước dâng (đốm xanh nhạt) trên đồng; các toán dân phu (son) dàn hàng đào dọc tuyến từ Tam Khê về Rạch Giá theo thanh kéo; đốm vàng sáng dần dọc tuyến; đốm vàng lớn trên núi Sập (Thoại Sơn); đốm ngà (bia) ở triền núi; người (son) đến dự lễ; thuyền (ngà) qua lại tấp nập trên tuyến kênh mới
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "nguyen-do": { ...shot([-200, 0, -200], 250, 300, 150, 1), mood: MOOD.overcast + 0.3 },
    "dao-kenh": { ...shot([0, 0, -20], 120, 250, 120, -1), mood: MOOD.day },
    "dat-ten": { ...shot([NUI_SAP[0], 0, NUI_SAP[1]], 90, 200, 90, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([0, 0, -20], 120, 340, 180, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
