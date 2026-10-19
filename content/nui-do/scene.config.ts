import { MOOD, type Keyframe, type SceneConfig, type Vec3 } from "@/core/types";
import { height } from "./terrain";

// Camera cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ: sông Chu chảy từ tây (x âm) sang đông (x dương) quanh z ≈ -40; núi Đọ ở khoảng (0, 95), núi Quan Yên ở đông nam,
// núi Nuông ở phía tây (xem terrain.ts). Cảnh cách điệu, không phải bản đồ.
// Khung hình: chữ bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ — `shot()` đẩy điểm nhìn sang bên
// kia để chủ thể (`focus`) nằm ở nửa màn hình không có chữ; màn dọc điện thoại nhìn thẳng vào `focus`.
// Hoạt cảnh của từng phân cảnh (chấm sáng minh hoạ hiện vật, đoàn người ước lệ…) chạy theo đồng hồ phân cảnh — xem scene.ts.

/** Máy quay ở `focus + from`, nhìn lệch khỏi `focus` để chủ thể rơi vào nửa màn hình đối diện khối chữ. */
function shot(
  focus: Vec3,
  from: Vec3,
  textOn: "right" | "left",
  mood: number,
  { fov = 50, spread = 0.3, cam: camAt, look: lookAt }: { fov?: number; spread?: number; cam?: Vec3; look?: Vec3 } = {},
): Keyframe {
  const cam: Vec3 = camAt ?? [focus[0] + from[0], focus[1] + from[1], focus[2] + from[2]];
  const dx = focus[0] - cam[0];
  const dy = focus[1] - cam[1];
  const dz = focus[2] - cam[2];
  const D = Math.hypot(dx, dy, dz);
  // vector phải màn hình = hướng nhìn × trục Y (hướng nhìn đã chuẩn hoá, trục Y = (0,1,0))
  let rx = -dz;
  let rz = dx;
  const rl = Math.hypot(rx, rz) || 1;
  rx /= rl;
  rz /= rl;
  // chữ bên phải → chủ thể ở bên trái → máy quay nhìn lệch sang phải chủ thể
  const s = (textOn === "right" ? 1 : -1) * spread * D;
  return { cam, look: lookAt ?? [focus[0] + rx * s, focus[1], focus[2] + rz * s], focus, mood, fov };
}

const on = (x: number, z: number, lift = 0): Vec3 => [x, height(x, z) + lift, z];

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-230, 70, -170], look: [10, 15, 95], mood: MOOD.dawn },
    // sông Chu, sông Mã hợp lưu và núi Đọ bên bờ
    "nui-ben-song": shot([130, 10, 30], [-170, 120, -170], "left", MOOD.dawn + 0.35, { spread: 0.25 }),
    // đoàn khảo sát đi từ bờ sông lên sườn tây nam
    "phat-hien": shot(on(-72, 135, 2), [-110, 45, -90], "right", MOOD.dawn + 0.7),
    // hòn đá bazan trên sườn đông: ghè thành mảnh tước
    "da-bazan": shot(on(88, 98, 1), [70, 28, -55], "left", MOOD.dawn + 0.9, { fov: 46 }),
    // chấm sáng hiện vật trên sườn đông và tây nam
    "cong-cu": // màn ngang nhìn cả hai sườn (đông, tây nam) từ phía nam; màn dọc nhìn vào sườn đông
    shot(on(85, 100, 3), [0, 0, 0], "right", MOOD.overcast, { fov: 52, cam: [50, 90, 260], look: [135, 15, 45] }),
    // người xưa từ bờ sông lên sườn núi (ước lệ)
    "nguoi-toi-co": shot(on(92, 85, 2), [-60, 35, -70], "left", MOOD.overcast, { fov: 48 }),
    // hai cách định niên đại: chấm sáng đổi màu qua lại
    "bao-nhieu-tuoi": shot(on(85, 100, 3), [0, 0, 0], "right", MOOD.overcast + 0.2, { fov: 52, cam: [-20, 120, 280], look: [130, 15, 45] }),
    // Quan Yên, Nuông và núi Đọ
    "quan-yen-nuong": shot([0, 20, 130], [-30, 200, -430], "left", MOOD.overcast + 0.3, { fov: 58, spread: 0.12 }),
    // di tích ngày nay
    "di-san": shot(on(88, 100, 10), [-120, 70, -100], "right", MOOD.sunset),
  },
};

export default config;
