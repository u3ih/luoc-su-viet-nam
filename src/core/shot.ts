import type { Keyframe, Vec3 } from "./types";

// Dựng khung hình cho keyframe: máy quay nhìn về hướng `az` (độ, 0 = +x, 90 = +z), cách chủ thể `dist` mét, cao `camH`.
// Chữ nằm bên phải ở phân cảnh chẵn, bên trái ở phân cảnh lẻ, nên chủ thể phải rơi vào nửa màn hình còn lại:
// `side = +1` chủ thể ở bên phải khung hình, `-1` bên trái; `shift` là độ lệch theo khoảng cách.
// Trả `cam`, `look` (đã đẩy lệch) và `focus` (để màn dọc trên điện thoại nhìn thẳng vào chủ thể).
// Không import three nên scene.config.ts nạp được phía server.
export function shot(focus: Vec3, az: number, dist: number, camH: number, side: 1 | -1, shift = 0.3): Pick<Keyframe, "cam" | "look" | "focus"> {
  const a = (az * Math.PI) / 180;
  const fx = Math.cos(a);
  const fz = Math.sin(a);
  // phải màn hình = (-fz, fx) trên mặt bằng; đẩy điểm nhìn lệch về phía đối diện chủ thể
  const lx = focus[0] + fz * side * dist * shift;
  const lz = focus[2] - fx * side * dist * shift;
  return { cam: [lx - fx * dist, camH, lz - fz * dist], look: [lx, focus[1], lz], focus };
}
