import { smoothstep } from "../engine/math";
import type { World } from "../engine/world";

// Đồng hồ riêng cho từng phân cảnh, để hoạt cảnh chạy trong lúc người xem dừng lại đọc (máy quay đứng yên,
// `t` gần như không đổi nên không thể chỉ dựa vào vị trí cuộn).
// - `elapsed(id)`: số giây kể từ khi cuộn tới phân cảnh; giữ nguyên khi đang rời đi (để mờ dần không giật),
//   về 0 khi đã đi xa → quay lại thì hoạt cảnh diễn lại từ đầu.
// - `near(id)`: độ hiện 0..1 theo khoảng cách tới phân cảnh.

export type BeatClock = { elapsed(id: string): number; near(id: string): number };

export function createBeatClock(world: World, ids: string[], { enter = 0.3, leave = 0.65 } = {}): BeatClock {
  const beats = ids.map((id) => world.beat(id));
  const time = ids.map(() => 0);
  const vis = ids.map(() => 0);
  const index = new Map(ids.map((id, i) => [id, i]));
  world.resolve((_, ctx) => {
    beats.forEach((b, i) => {
      const d = Math.abs(ctx.t - b);
      if (d < enter) time[i] += ctx.dt;
      else if (d > leave) time[i] = 0;
      vis[i] = 1 - smoothstep(enter, leave, d);
    });
  });
  return {
    elapsed: (id) => time[index.get(id) ?? -1] ?? 0,
    near: (id) => vis[index.get(id) ?? -1] ?? 0,
  };
}
