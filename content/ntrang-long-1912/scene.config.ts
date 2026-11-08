import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { PU_SRA, DAK_HUICH, BOU_POU_SRA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đồn Pu Sra (PU_SRA) giữa; Đắk Huich (DAK_HUICH) tây nam; đồn Pétsa (PETSA), Bou Méra (BOU_MERA); làng Bou Pou Sra (BOU_POU_SRA).
// Hoạt cảnh trong từng phân cảnh: đốm ngà (tù trưởng) giữa buôn; người M'Nông (son) quây quần; lửa bùng ở đồn Pu Sra; đoàn quân (xanh nhạt) từ phía bắc kéo vào lùng sục; các đồn mới (xanh nhạt) sáng ở Pétsa, Bou Méra; đốm ngà về nguồn Đắk Huich; các buôn làng (đốm vàng) lần lượt hưởng ứng theo thanh kéo, người (son) tụ lại; nghĩa quân (son) bao quanh làng Bou Pou Sra; đốm xanh nhạt ở giữa làng lịm dần; về sau đốm vàng sáng (di tích)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "ten-goi": { ...shot([PU_SRA[0], 0, PU_SRA[1]], 70, 240, 140, 1), mood: MOOD.day },
    "pu-sra": { ...shot([40, 0, 20], 80, 300, 170, -1), mood: MOOD.sunset + 0.5 },
    "dak-huich": { ...shot([DAK_HUICH[0], 0, DAK_HUICH[1]], 240, 260, 150, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([BOU_POU_SRA[0], 0, BOU_POU_SRA[1]], 70, 220, 130, -1), mood: MOOD.dawn + 0.3 },
  },
};

export default config;
