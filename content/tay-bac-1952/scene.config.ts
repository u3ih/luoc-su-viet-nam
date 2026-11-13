import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Nghĩa Lộ (NGHIA_LO) đông bắc; Mộc Châu (MOC_CHAU) nam; Sơn La (SON_LA), Nà Sản (NA_SAN) tây nam; Sầm Nưa (SAM_NUA) tây.
// Hoạt cảnh trong từng phân cảnh: các đại đoàn (son) vượt sông Hồng tiến về Nghĩa Lộ; hai đồn (đốm xanh nhạt) tắt, lửa bùng; theo thanh kéo, các đoàn quân (son) vượt sông Đà tiến lên Mộc Châu và Sơn La; đồn Sơn La (đốm xanh nhạt) tắt; vòng điểm tựa (đốm xanh nhạt) quanh lòng chảo Nà Sản; các mũi quân (son) đánh vào rồi lui lại; lửa trên các đồi; các đại đoàn (son) tiến sang phía tây tới Sầm Nưa (đốm ngà) rồi quay về
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "nghia-lo": { ...shot([140, 0, 110], 60, 190, 110, 1), mood: MOOD.overcast + 0.6 },
    "song-da": { ...shot([40, 0, -30], 100, 230, 130, -1), mood: MOOD.dawn + 0.6 },
    "na-san": { ...shot([-50, 0, -130], 80, 170, 100, 1), mood: MOOD.sunset + 0.75 },
    "thuong-lao": { ...shot([-110, 0, 20], 160, 220, 130, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
