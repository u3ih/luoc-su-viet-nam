// Toạ độ dùng chung cho terrain.ts, scene.ts và scene.config.ts (file này không import three nên an toàn cho server).

/** Thềm trước cửa hang (đã san phẳng) và chân lối mòn dốc xuống thung lũng. */
export const LEDGE = { x: 0, z: 24, y: 33 };
export const PATH_FOOT = -46;

/** Cột lớp đất minh hoạ, đặt ở thung lũng phía tây nam lối mòn. */
export const COLUMN = { x: -46, z: -10 };
