import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thư viện (THU_VIEN) giữa.
// Hoạt cảnh trong từng phân cảnh: một đốm vàng (nghị định) sáng; thợ (son) dựng thư viện, nền (lưới đốm ngà mờ) hiện dần; theo thanh kéo, các kệ sách (cột đốm vàng) cao dần; người đọc (son) tới; đốm vàng ở thư viện đổi sắc qua các tên gọi (vàng, ngà, xanh nhạt, vàng) lần lượt; dòng xuất bản phẩm (chấm ngà) từ khắp nơi đổ về thư viện; kho sách (lưới đốm vàng) lớn dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "nghi-dinh": { ...shot([0, 0, 20], 80, 200, 110, 1), mood: MOOD.dawn + 0.5 },
    "mo-cua": { ...shot([0, 0, 20], 85, 170, 90, -1), mood: MOOD.sunset + 0.65 },
    "doi-ten": { ...shot([0, 0, 20], 75, 200, 110, 1), mood: MOOD.sunset + 0.6 },
    "ngay-nay": { ...shot([0, 0, 20], 85, 220, 130, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
