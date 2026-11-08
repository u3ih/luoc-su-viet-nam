import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HANG_NAU, TRUONG_THI, MOM_SONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Phố Hàng Nâu (HANG_NAU), trường thi (TRUONG_THI) bắc, bến sông (MOM_SONG) đông nam.
// Hoạt cảnh trong từng phân cảnh: phố Hàng Nâu: người (son) qua lại; một đốm ngà nhỏ (cậu bé) trong phố; theo thanh kéo, tám lần sĩ tử (son) dồn về trường thi; tám đốm vàng (tám khoa) lần lượt sáng; đốm thứ tư sáng hơn (đỗ tú tài); đốm ngà (bà Tú) đi lại buôn bán ở bến sông; thuyền (chấm ngà) qua lại; đốm ngà ở Hàng Nâu lịm; các đốm vàng nhỏ (bài thơ) còn sáng khắp phố
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "hang-nau": { ...shot([HANG_NAU[0], 0, HANG_NAU[1]], 80, 200, 90, 1), mood: MOOD.day },
    "tam-khoa": { ...shot([TRUONG_THI[0], 0, TRUONG_THI[1]], 80, 220, 100, -1), mood: MOOD.overcast + 0.4 },
    "thuong-vo": { ...shot([MOM_SONG[0], 0, MOM_SONG[1]], 70, 180, 80, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([HANG_NAU[0], 0, HANG_NAU[1]], 80, 200, 90, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
