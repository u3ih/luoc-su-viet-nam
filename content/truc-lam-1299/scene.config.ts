import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { YEN_TU } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Núi Yên Tử (YEN_TU) đông bắc, Ngọa Vân (NGOA_VAN) xa hơn, chân núi (CHAN_NUI); đồng bằng tây nam có kinh đô (THANG_LONG), Đông Cứu (DONG_CUU), Vũ Lâm (VU_LAM). Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: một chấm ngà rời kinh đô trong đêm đi về phía núi Đông Cứu, đốm vàng sáng ở Đông Cứu, một toán người (son) đuổi theo; người (son) tụ về kinh đô, đốm vàng sáng ở kinh đô; một đốm ngà rời kinh đô đi về Vũ Lâm; một đốm ngà dẫn đoàn người (son) theo đường núi từ chân núi lên Yên Tử theo thanh kéo, các đốm vàng (tịnh xá) sáng dần dọc đường; ba dòng ánh sáng (ngà, xanh nhạt, vàng) từ ba phía hợp về Yên Tử; các nhóm người (son) đi giảng ở đồng bằng; đốm vàng trên đỉnh Ngọa Vân sáng rồi lặng; ba đốm vàng tỏa về ba nơi (Quy Đức, Hoa Yên, Phổ Minh)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,170,-320], look: [140,60,140], mood: MOOD.dawn + 0.3 },
    "thai-tu": { ...shot([-200, 0, -150], 140, 230, 100, 1), mood: MOOD.sunset + 0.7 },
    "nhuong-ngoi": { ...shot([-290, 0, -120], 120, 230, 110, -1), mood: MOOD.day },
    "len-nui": { ...shot([95, 0, 85], 45, 360, 200, 1), mood: MOOD.day },
    "mot-dong": { ...shot([YEN_TU[0], 0, YEN_TU[1]], 50, 400, 210, -1), mood: MOOD.day },
    "vien-tich": { ...shot([200, 0, 180], 50, 340, 200, 1), mood: MOOD.sunset + 0.3 },
  },
};

export default config;
