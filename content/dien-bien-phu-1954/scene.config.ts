import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Mường Thanh (MUONG_THANH) giữa; sân bay (SAN_BAY) bắc; Him Lam (HIM_LAM) đông bắc; A1 đông; Isabelle nam; Pha Sông (PHA_SONG) núi đông bắc.
// Hoạt cảnh trong từng phân cảnh: lính dù (đốm xanh nhạt) rơi xuống lòng chảo; các cụm cứ điểm (đốm xanh nhạt) lần lượt dựng quanh sân bay; theo thanh kéo, đoàn dân công (son) và đoàn kéo pháo (ngà) vượt núi Pha Sông vào các sườn núi quanh lòng chảo; các đơn vị (son) đào hào vây lấn từ chân núi vào các cụm (đốm xanh nhạt) — Him Lam, rồi A1 — các cụm lần lượt tắt; các đơn vị (son) từ bốn phía tiến vào khu trung tâm Mường Thanh; hầm chỉ huy (đốm xanh nhạt) tắt, đốm vàng sáng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "long-chao": { ...shot([0, 0, 20], 80, 250, 170, 1), mood: MOOD.day },
    "keo-phao": { ...shot([200, 0, 200], 50, 220, 150, -1), mood: MOOD.sunset + 0.6 },
    "ba-dot": { ...shot([60, 0, 40], 70, 230, 140, 1), mood: MOOD.dawn + 0.6 },
    "ngay-7-5": { ...shot([0, 0, 20], 90, 170, 80, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
