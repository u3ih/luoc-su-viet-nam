import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Chùa (CHUA) giữa bên ngã ba sông; kho (KHO) cạnh chùa; Yên Tử (YEN_TU) đông bắc.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (chùa) sáng bên ngã ba sông; tăng ni (chấm ngà) từ nhiều nơi tụ về học; theo thanh kéo, các bộ ván kinh (lưới đốm vàng) lần lượt xếp đầy kho rộng mười gian; một chấm ngà (hồ sơ) đi xa rồi trở về; đốm vàng lớn (di sản tư liệu) sáng trên kho ván; các cụm di tích Trúc Lâm (đốm vàng: Vĩnh Nghiêm, Yên Tử, các nơi khác) cùng sáng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "chua-la": { ...shot([30, 0, 30], 75, 210, 110, 1), mood: MOOD.dawn + 0.5 },
    "van-kinh": { ...shot([90, 0, 50], 85, 150, 80, -1), mood: MOOD.sunset + 0.65 },
    "bangkok": { ...shot([60, 0, 40], 80, 200, 110, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([140, 0, 140], 55, 250, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
