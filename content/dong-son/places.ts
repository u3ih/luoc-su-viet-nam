// Toạ độ dùng chung cho cảnh và máy quay (không import three để scene.config.ts nạp được phía server).
// Cảnh CÁCH ĐIỆU: vị trí các điểm dưới đây chỉ là gợi ý bố cục, không phải vị trí thật của di tích.

/** Nơi ba dòng sông gặp nhau (gợi ý "ngã ba sông" mà nguồn nêu về chỗ có trung tâm lớn). */
export const CONFLUENCE: [number, number] = [-60, -20];
/** Chỗ bờ sông lộ đồ đồng sau mưa lớn (phân cảnh "phat-hien"). */
export const FIND: [number, number] = [-108, 36];
/** Làng lớn trên thềm đất phía bắc ngã ba sông. */
export const CENTER: [number, number] = [0, 70];
/** Xưởng đúc đồng. */
export const FOUNDRY: [number, number] = [-32, 114];
/** Bãi đất trống nơi mở hội. */
export const FESTIVAL: [number, number] = [62, 118];
/** Ruộng thấp ven sông: hình chữ nhật [x0, x1, z0, z1], mặt bằng phẳng ngập khi nước triều lên. */
export const FIELDS = { x0: 74, x1: 214, z0: -26, z1: 30 };
/** Độ cao mặt ruộng (m). */
export const FIELD_Y = 0.95;
/** 11 điểm gợi ý các trung tâm kinh tế – xã hội (số lượng theo nguồn; vị trí chỉ là minh hoạ). */
export const CENTERS: [number, number][] = [
  [0, 70], [-200, 150], [-300, 40], [-250, -120], [-110, -220], [60, -190], [230, -110], [300, 80], [190, 210], [-70, 250], [-180, 300],
];
