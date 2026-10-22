// Toạ độ dùng chung cho cảnh và máy quay (không import three để scene.config.ts nạp được phía server).
// Cảnh CÁCH ĐIỆU: vị trí các điểm dưới đây chỉ là gợi ý bố cục, không phải vị trí thật của di chỉ.

/** Gò đất cao, rộng — chỗ gợi ý "làng Đồng Đậu". */
export const SITE: [number, number] = [-40, 40];
/** Gò nhô cao hơn đồng quanh bao nhiêu (m). */
export const SITE_RISE = 3.5;
/** Đầm nước phía đông gò: tâm, bán kính mép nước (m). */
export const LAKE: [number, number] = [135, 55];
export const LAKE_R = 58;
/** Lò nấu đồng (phân cảnh "duc-dong"). */
export const FURNACE: [number, number] = [-62, 22];
/** Ba khuôn đúc quanh lò (phân cảnh "duc-dong"). */
export const MOLDS: [number, number][] = [[-52, 30], [-48, 24], [-50, 17]];
/** Chỗ đặt các nền nhà (phân cảnh "nen-nha"): tâm từng nền. */
export const HOUSES: [number, number][] = [[-12, 62], [-30, 70], [4, 38], [-22, 48], [10, 20], [-48, 56], [-8, 30]];
/** Chỗ nung gốm và chỗ chế tác đá ngọc (phân cảnh "gom-da"). */
export const POTTERY: [number, number] = [-2, 78];
export const JADE: [number, number] = [-70, 66];
/** Khu mộ (phân cảnh "tuc-le"). */
export const GRAVES: [number, number] = [-125, 112];
