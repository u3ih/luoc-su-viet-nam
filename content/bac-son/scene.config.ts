import { MOOD, type Keyframe, type SceneConfig, type Vec3 } from "@/core/types";
import { height } from "./terrain";

// Camera cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ: vòng cung núi đá vôi ở phía bắc (z lớn) mở về phía nam; thung lũng ở giữa, con suối chảy ngang ở z ≈ 85;
// ngọn núi có hang ở (0, 295), thềm trước cửa hang ở khoảng (0, 204). Cảnh cách điệu — xem terrain.ts.
// Khung hình: chữ bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ — `shot()` đẩy điểm nhìn sang bên
// kia để chủ thể (`focus`) nằm ở nửa màn hình không có chữ; màn dọc điện thoại nhìn thẳng vào `focus`.
// Hoạt cảnh của từng phân cảnh (chấm sáng địa điểm, đoàn người ước lệ, bếp lửa, rẫy…) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Bầu trời chỉ dùng dải bình minh (0) → u ám (1) → hoàng hôn (2); không đi qua "night" (3) hay "day" (4).

/** Máy quay ở `focus + from`, nhìn lệch khỏi `focus` để chủ thể rơi vào nửa màn hình đối diện khối chữ. */
function shot(
  focus: Vec3,
  from: Vec3,
  textOn: "right" | "left",
  mood: number,
  { fov = 50, spread = 0.3 }: { fov?: number; spread?: number } = {},
): Keyframe {
  const cam: Vec3 = [focus[0] + from[0], focus[1] + from[1], focus[2] + from[2]];
  const dx = focus[0] - cam[0];
  const dy = focus[1] - cam[1];
  const dz = focus[2] - cam[2];
  const D = Math.hypot(dx, dy, dz);
  // vector phải màn hình = hướng nhìn × trục Y
  let rx = -dz;
  let rz = dx;
  const rl = Math.hypot(rx, rz) || 1;
  rx /= rl;
  rz /= rl;
  // chữ bên phải → chủ thể ở bên trái → máy quay nhìn lệch sang phải chủ thể
  const s = (textOn === "right" ? 1 : -1) * spread * D;
  return { cam, look: [focus[0] + rx * s, focus[1], focus[2] + rz * s], focus, mood, fov };
}

const on = (x: number, z: number, lift = 0): Vec3 => [x, height(x, z) + lift, z];

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-300, 95, -190], look: [0, 25, 150], mood: MOOD.dawn },
    // vòng cung đá vôi và năm cụm di tích trong thung lũng
    "thung-lung": shot(on(0, 150), [-40, 130, -330], "left", MOOD.dawn + 0.4, { fov: 52, spread: 0.22 }),
    // đoàn khảo sát đi từ bờ suối vào một cụm hang phía tây, rồi các địa điểm lần lượt sáng lên
    "phat-hien": shot(on(-70, 175, 2), [70, 55, -170], "right", MOOD.dawn + 0.7),
    // hòn cuội ven suối: ghè rồi mài lưỡi
    "riu-mai-luoi": shot(on(55, 138, 1), [-22, 15, -52], "left", MOOD.overcast - 0.1, { fov: 46, spread: 0.28 }),
    // niên đại: ánh sáng từ vùng lõi lan ra các hang xa
    "tuoi-tac": shot([150, 5, 60], [60, 170, -250], "right", MOOD.overcast + 0.1, { fov: 58, spread: 0.3 }),
    // bếp lửa trước cửa hang; người đi ra suối và về
    "bep-gom": shot(on(0, 198, 3), [-105, 36, -150], "left", MOOD.overcast + 0.65, { fov: 50 }),
    // khoảnh đất trống giữa rừng
    "lam-ray": shot(on(-95, 128, 2), [95, 38, -95], "right", MOOD.dawn + 0.55, { fov: 48 }),
    // ánh sáng dịu trước cửa hang lúc chiều tà
    "mo-tang": shot(on(0, 198, 3), [-65, 30, -100], "left", MOOD.sunset + 0.6, { fov: 48 }),
    // hai dòng ánh sáng gặp nhau; một dòng nữa đi tiếp về phía đồng bằng
    "noi-tiep": shot([50, 5, 70], [60, 150, -250], "right", MOOD.dawn + 0.3, { fov: 56, spread: 0.2 }),
  },
};

export default config;
