import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Phố cổ (PHO_CO) giữa; Long Biên (LONG_BIEN), bãi giữa (BAI_GIUA) đông; Vạn Phúc (VAN_PHUC) tây nam; hang Trầm (HANG_TRAM) tây.
// Hoạt cảnh trong từng phân cảnh: quân Pháp (xanh nhạt) vào đóng ở Hà Nội theo hiệp định; các vị trí (đốm xanh nhạt) xen với khu phố (đốm ngà); theo thanh kéo, đèn thành phố (đốm vàng) vụt tắt, các điểm giao tranh (lửa) bùng lên ở nhiều vị trí; từ hang Trầm (đốm vàng) lời kêu gọi lan ra (vòng đốm ngà); người dân (son) các làng ra đường; từng toán nhỏ (son) lặng lẽ rời khu phố cổ, qua bãi giữa dưới gầm cầu Long Biên sang bờ bắc
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "hoa-hoan": { ...shot([20, 0, 60], 80, 230, 130, 1), mood: MOOD.overcast + 0.6 },
    "dem-19-12": { ...shot([20, 0, 60], 90, 170, 80, -1), mood: MOOD.sunset + 0.9 },
    "loi-keu-goi": { ...shot([-200, 0, -80], 70, 200, 100, 1), mood: MOOD.dawn + 0.5 },
    "vuot-song": { ...shot([110, 0, 90], 100, 160, 60, -1), mood: MOOD.dawn + 0.2 },
  },
};

export default config;
