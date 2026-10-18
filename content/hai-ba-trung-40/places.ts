import { ME_LINH } from "./terrain";

// Vị trí các nơi trong hoạt cảnh từng phân cảnh. Bản đồ là đồng bằng Mê Linh cách điệu (xem terrain.ts), thu nhỏ
// tượng trưng — chỉ giữ hướng tương đối giữa các nơi, không theo tỉ lệ thật. Mọi vị trí dưới đây là DIỄN HOẠ,
// cần người thẩm định xem lại:
// - Bản đồ cách điệu đặt núi Ba Vì cùng bờ sông với Mê Linh (thực tế Ba Vì ở bờ nam sông Hồng), nên Cấm Khê,
//   bến sông Hát và đền Hát Môn cũng đặt ở bờ bắc, dưới chân Ba Vì.
// - Trị sở của Tô Định: lời kể chỉ nói "thành"; đặt ở phía đông Mê Linh theo hướng Luy Lâu (trị sở quận Giao Chỉ
//   thời Hán theo nhiều nhà nghiên cứu — vẫn còn bàn luận).
// - Chu Diên: vị trí còn bàn luận; đặt ở phía đông nam, nhà trai đi dọc bờ bắc sông tới Mê Linh.
// - Lãng Bạc: vị trí còn bàn luận (Hồ Tây hay Tiên Du, xem story.md); đặt trên đồng bằng phía đông Mê Linh.

export type XZ = [number, number];

/** Làng Lạc tướng mà quan lại Hán tới sai khiến, thu vơ vét (phân cảnh "nha-han"). */
export const LAC_VILLAGE: XZ = [-80, 40];
/** Các xóm quanh đó, nơi người dân mang của cải tới nộp. */
export const HAMLETS: XZ[] = [
  [-20, -30],
  [-150, 0],
  [0, 110],
];
/** Đường quan lại Hán từ phương bắc xuống. */
export const NORTH_ROAD: XZ[] = [[-30, 340], [-55, 190], LAC_VILLAGE];

export const MELINH: XZ = [ME_LINH.x, ME_LINH.z];
/** Đường nhà trai từ Chu Diên tới Mê Linh (dọc bờ bắc sông). */
export const CHU_DIEN_ROAD: XZ[] = [[230, -62], [150, -42], [80, -14], [30, 10], [8, 20]];

/** Thành của Thái thú Tô Định. */
export const TO_DINH: XZ = [190, 20];
/** Đường Tô Định bỏ thành chạy về phương bắc. */
export const FLEE_ROAD: XZ[] = [TO_DINH, [215, 100], [240, 200], [255, 330]];

export const LANG_BAC: XZ = [150, -30];
export const CAM_KHE: XZ = [-190, 28];
/** Bến sông Hát (ven sông, dưới chân Ba Vì) và điểm giữa dòng. */
export const HAT_BANK: XZ = [-215, -118];
export const HAT_WATER: XZ = [-218, -140];

/** Ba ngôi đền thờ nổi tiếng nhất trong lời kể. */
export const TEMPLES: { at: XZ; from: XZ }[] = [
  // Hát Môn — phía tây nam Mê Linh, bên sông Hát
  { at: [-180, -100], from: [-140, -40] },
  // Hạ Lôi — đất Mê Linh
  { at: [8, 32], from: [-40, -20] },
  // Đồng Nhân — phía đông nam, bên kia sông
  { at: [100, -180], from: [150, -160] },
];
