import { mulberry32 } from "@/core/engine/math";
import type { SceneSetup } from "@/core/engine/world";
import { createDust } from "@/core/world/dust";
import { createProps, scatter } from "@/core/world/props";
import { createHeightTexture, createTerrain, fbm2, type HeightBounds } from "@/core/world/terrain";
import { createWater } from "@/core/world/water";

// Cảnh mẫu tối giản: đồi thấp, mặt nước, vài bụi tre. Chép thư mục này rồi sửa dần.

const BOUNDS: HeightBounds = { minX: -300, minZ: -300, sizeX: 600, sizeZ: 600, minH: -10, maxH: 40 };
const height = (x: number, z: number) => -4 + Math.pow(fbm2(x * 0.012, z * 0.012), 2) * 40;

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const rand = mulberry32(1);

  world.add(
    createTerrain({
      bounds: BOUNDS,
      segments: q.terrainSeg,
      height,
      colorize: (h, _x, _z, c) => c.setHSL(0.22, 0.3, 0.12 + Math.min(h, 20) * 0.006),
    }),
  );
  world.add(
    createWater({
      heightTex: createHeightTexture(height, BOUNDS),
      bounds: BOUNDS,
      segments: q.waterSeg,
      level: (ctx) => -1 + ctx.params.level, // ví dụ: tham số "level" điều khiển mực nước
      sky: () => world.mood,
    }),
  );
  world.add(createDust(q.dust, { x: 0, y: 0, z: 0 }, { x: 160, y: 30, z: 160 }));

  const bamboo = scatter(Math.round(60 * q.density), rand, { x0: -120, x1: 120, z0: -120, z1: 120 }, (x, z) => {
    const h = height(x, z);
    return h > 1 && h < 10 ? h - 0.2 : null;
  });
  world.add(await createProps("bui_tre", bamboo, { quality: q, recenter: true, shadow: q.shadows, sway: 0.0035 }));
};

export default setup;
