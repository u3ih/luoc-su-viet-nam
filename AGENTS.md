<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Hướng dẫn cho AI agent — Lược sử Việt Nam

File này dành cho AI agent (Claude Code, Cursor, Copilot, Codex…) và cả người đóng góp code. Đọc hết trước khi sửa bất cứ thứ gì. Khi quy tắc ở đây mâu thuẫn với thói quen chung của bạn, **làm theo file này**.

## 1. Dự án là gì

Web kể chuyện lịch sử Việt Nam bằng cảnh 3D tương tác. Cuộn trang thì máy quay bay qua các phân cảnh; người xem có thể tự tay tác động vào cảnh (ví dụ kéo cho nước triều rút). Đây là dự án cộng đồng: nhiều người cùng viết chương, nên **tính nhất quán và khả năng tái sử dụng quan trọng hơn sự khéo léo riêng lẻ**.

- **Chỉ có frontend.** Next.js 16 (App Router) build ra trang tĩnh, deploy lên Vercel qua GitHub. Không có backend, database hay API route. Đừng thêm.
- **Stack:** Next.js 16 · React 19 (React Compiler bật) · TypeScript strict · Three.js (thuần, không React Three Fiber) · GSAP (ScrollTrigger, SplitText) · Lenis · Blender 5 (Python) để làm model · gltf-transform.
- **Ngôn ngữ:** giao diện, nội dung và comment trong code viết bằng **tiếng Việt có dấu**. Tên biến/hàm bằng tiếng Anh; tên đạo cụ/asset có thể dùng tiếng Việt không dấu (`thuyen_ngo`, `bui_tre`).

## 2. Bản đồ thư mục

```
content/                         NỘI DUNG — mỗi chương một thư mục
  01-bach-dang-938/
    story.md                     lời kể (Markdown, đọc trên GitHub) — NGUỒN DUY NHẤT của chữ
    scene.config.ts              keyframe máy quay + tham số, khớp theo id phân cảnh
    scene.ts                     SceneSetup: dựng cảnh 3D của chương
    terrain.ts, actors/*.ts      thành phần riêng của chương
  _mau/                          mẫu chương tối giản (chép để tạo chương mới)
  registry.generated.ts          TỰ SINH bởi scripts/gen-content.mjs — không sửa tay
  README.md                      đặc tả định dạng story.md (đọc trước khi sửa nội dung)

src/
  app/                           route: / (trang chủ), /chuong/[slug]
  core/                          BỘ KHUNG DÙNG CHUNG cho mọi chương
    types.ts                     kiểu dữ liệu: ChapterText, Beat, Keyframe, SceneConfig, MOOD
    content/                     parse story.md (server-only), nạp chương, link GitHub
    engine/                      Engine (render loop, camera spline, chất lượng thích ứng), assets (GLB), World/Actor
    world/                       thành phần cảnh tái sử dụng: sky, water, terrain, dust, props, grass, birds, foliage, rocks, atmosphere
    story/store.ts               trạng thái chung UI ↔ engine (t, inputs, signals)
    audio/                       giọng kể (Web Speech / file audio), âm thanh nền tổng hợp
    ui/                          component React dùng chung: StoryShell, Hero, BeatSection, ornaments…
  site.config.ts                 tên miền, repo GitHub, lộ trình chương

blender/
  lib/vn.py                      thư viện dựng model + BẢNG MÀU chung
  assets/<ten>.py                mỗi file sinh một model (hàm build())
  sources/<ten>.blend            model làm tay (tuỳ chọn)
  previews/                      ảnh xem trước tự render
public/models/<ten>.glb          model đã tối ưu (artifact — commit vào repo)
scripts/                         gen-content.mjs, build-assets.mjs
```

## 3. Lệnh

| Lệnh | Khi nào |
|---|---|
| `pnpm dev` | chạy local (tự sinh registry trước) |
| `pnpm content` | sau khi thêm/đổi tên thư mục chương hoặc `slug` |
| `pnpm content --check` | CI: báo lỗi nếu registry lỗi thời |
| `pnpm typecheck` | kiểm tra kiểu |
| `pnpm build` | build production; **kiểm tra khớp id ↔ keyframe** và lỗi định dạng story.md |
| `pnpm assets [ten…]` | dựng lại model từ Blender (cần Blender 5.x cài sẵn, hoặc đặt `BLENDER_BIN`) |

**Trước khi báo xong việc, bắt buộc chạy `pnpm typecheck && pnpm build`.** Nếu có sửa cảnh hay giao diện, mở trình duyệt xem thật (desktop và khổ điện thoại 390px) và nói rõ bạn đã kiểm tra những gì, chưa kiểm tra những gì.

## 4. Quy tắc bất biến

1. **Chữ chỉ nằm trong `story.md`.** Không viết lời kể vào file `.ts` hay `.tsx`. Component nhận chữ qua props từ `ChapterText`.
2. **Mỗi `id` phân cảnh có đúng một keyframe** trong `scene.config.ts`. Đổi `id` thì sửa cả hai nơi.
3. **Code chung nằm trong `src/core/`; code riêng của chương nằm trong `content/<chương>/`.** Một chương không được import từ thư mục chương khác. Nếu hai chương cần cùng một thứ, hãy đưa nó vào `src/core/world` hoặc `src/core/ui`.
4. **`src/core` không biết chương cụ thể nào.** Không viết `if (slug === "bach-dang-938")` trong core. Hành vi riêng của chương phải đi qua API `World` (`world.resolve`, `world.signal`, `world.beat`).
5. **Không sửa tay `registry.generated.ts`.** Chạy `pnpm content`.
6. **Model 3D đi qua pipeline Blender.** Không thêm file `.glb` tải từ nguồn ngoài nếu chưa rõ giấy phép. Model mới thì viết `blender/assets/<ten>.py` dùng bảng màu `PALETTE`, chạy `pnpm assets <ten>`, rồi commit cả `.py`, `.glb` và ảnh preview.
7. **Không thêm backend, API route, cơ sở dữ liệu, tracking hay cookie.**
8. **Nội dung lịch sử:** không bịa sự kiện, số liệu hay lời thoại của nhân vật lịch sử. Mọi chi tiết phải có nguồn trong "Nguồn tham khảo". Diễn ý thì ghi `(diễn ý)`. Không chép dài bản dịch hiện đại. Nếu không chắc một chi tiết, **hỏi lại hoặc ghi chú TODO cần thẩm định**, đừng đoán.

## 5. Kiến trúc cảnh 3D

### Dòng chảy dữ liệu

```
story.md ──parse(server)──► ChapterText ─┐
scene.config.ts ────────────► SceneConfig ┴─► StoryShell (client)
                                                 ├─ UI: Hero, BeatSection, Timeline…  (đọc story.t, ghi story.inputs)
                                                 └─ SceneStage ─► createEngine(keyframes) ─► scene.ts setup(world)
```

- `story.t` là vị trí liên tục theo phân cảnh (ví dụ 2.4 = giữa phân cảnh 2 và 3), tính từ vị trí cuộn trang.
- Mỗi frame, Engine làm lần lượt:
  1. Nội suy keyframe theo `t`: máy quay đi theo spline Catmull-Rom, tham số nội suy tuyến tính và hơi dừng quanh mỗi keyframe.
  2. Gọi các hàm `world.resolve(fn)` để chương chỉnh tham số mục tiêu.
  3. Làm mượt (`damp`) toàn bộ tham số.
  4. Gọi `actor.update(ctx)` cho từng actor.
  5. Render.

### API cho `scene.ts`

```ts
const setup: SceneSetup = async (world) => {
  world.quality            // tier "low" | "mid" | "high": terrainSeg, waterSeg, dust, density, shadows
  world.mood               // màu trời / nắng hiện tại (cho shader nước…)
  world.add(actor)         // Actor = { object?: Object3D; update?(ctx); dispose?() }
  world.resolve((target, ctx) => { … })  // chỉnh tham số trước khi làm mượt (logic tương tác)
  world.signal("battle", 0.8)            // phát tín hiệu cho UI/âm thanh (story.signals)
  world.beat("nuoc-rut")                 // id → chỉ số phân cảnh (so với ctx.t)
};
```

`ctx` gồm: `t`, `time`, `dt`, `now`, `params` (tham số đã làm mượt), `inputs` (giá trị tương tác đã làm mượt), `completedAt[key]`, `camera`, `pixelScale`.

### Thành phần có sẵn (`src/core/world`) — dùng lại trước khi viết mới

| Hàm | Dùng cho |
|---|---|
| `createTerrain({ bounds, segments, height, colorize })` | địa hình từ hàm độ cao; `colorize` nhận thêm `slope` (0 phẳng → 1 dựng đứng); `wetLevel` làm sẫm dải đất ướt ven nước |
| `createHeightTexture(height, bounds)` | bản đồ độ cao cho shader nước |
| `createWater({ heightTex, bounds, level, sky, wakes? })` | mặt nước có bọt ven bờ, phản chiếu trời, vảy vàng sơn mài; `wakes` = mảng `[x, z, vx, vz]` để vẽ sóng đuôi thuyền |
| `createDust(count, center, extent)` | bụi vàng lơ lửng |
| `createProps(model, placements, { quality, … })` | rải hàng loạt model Blender (chia ô + LOD, tự dùng `.lite.glb`); `sway` cho cây lay theo gió, `tint` cho mỗi bản sao lệch màu nhẹ, `maxDistance` để ẩn ô xa |
| `createChunked({ variants, material, instances, quality })` | chia ô + LOD cho đạo cụ tự dựng (xem `world/instancing.ts`) |
| `bakeModelLod(name, quality)` | `{ full, lite }` theo bậc chất lượng (thuyền, cọc… tự quản InstancedMesh) |
| `createGrass({ count, area, accept, height, base, tip })` | cỏ, lau sậy procedural lay theo gió (một draw call) |
| `createBirds({ flocks, perFlock, center, radius, altitude })` | đàn chim bay vòng, vỗ cánh |
| `createFoliage({ kind: "tree" \| "bush" \| "palm", count, area, accept })` | cây rừng, bụi, dừa dựng bằng code — phủ kín đồi xa |
| `createRocks({ count, area, accept })` | đá tảng có rêu ven bờ, sườn dốc |
| `createSmoke`, `createMist`, `createRanges` (`world/atmosphere.ts`) | khói bếp, sương là là mặt nước, dãy núi xa nhiều lớp theo màu trời |
| `scatter(count, rand, area, accept, minDist)` | sinh vị trí rải theo luật |
| `bakeModel(name, { filter, recenter, smooth })` + `getPropMaterial()` | tự làm InstancedMesh có cập nhật mỗi frame (thuyền, cọc…) |
| `mulberry32(seed)` | số ngẫu nhiên có seed — **luôn dùng thay `Math.random`** để cảnh lần nào cũng giống nhau |

### Hiệu năng — ngân sách bắt buộc

**Hiệu năng trên điện thoại là ưu tiên số một**, trên cả độ đẹp. Đo trước và sau mọi thay đổi về cảnh (xem "Đo" bên dưới).

- Đạo cụ rải hàng loạt đi qua `createChunked` (`world/instancing.ts`, đã dùng sẵn trong `createProps` / `createFoliage` / `createGrass` / `createRocks`): chia ô theo mặt đất để frustum culling loại ô ngoài khung nhìn, ô xa đổi sang hình lite, ô quá xa (`maxDistance`) ẩn hẳn. Một InstancedMesh trải cả bản đồ thì không bao giờ bị loại và GPU vẽ cả nghìn cây sau lưng máy quay. Không tạo `Mesh` riêng cho từng bản sao.
- **Mỗi đạo cụ có bản lite.** Model Blender: dùng `lod(đầy_đủ, lite)` / `LITE` trong script (xem `blender/README.md`), `pnpm assets` dựng thêm `<ten>.lite.glb` và ghi `public/models/lite.json`. Khối procedural: tham số `lite` (khối 12 mặt thay khối 80 mặt, ít khối lá hơn). Một asset mới chưa xong khi chưa có đường lite.
- Bậc chất lượng (`engine/quality.ts`): `high` / `mid` / `low` — mật độ, bản lite, khoảng LOD, tầm vẽ, shader rẻ (`cheapShaders`: trời ít lớp mây, nước một lớp gợn, đất bỏ nhiễu theo điểm ảnh, tắt sương), số vệt sóng thuyền, bóng đổ. Mật độ rải nhân với `world.quality.density`; tham số nào tốn điểm ảnh thì có nhánh rẻ cho `cheapShaders`.
- **Bộ điều tốc** (Engine): chỉ đo khung "bận" (đang cuộn, máy quay đang trôi). Chậm thì hạ độ phân giải; đã chạm đáy mà vẫn chậm thì nhớ bậc thấp hơn 7 ngày trong `localStorage` (`lsvn-quality`), áp từ lần mở sau. `?quality=high|mid|low` ghim bậc và tắt bộ điều tốc — dùng để xem bản điện thoại trên máy tính.
- **Cảnh đứng yên vẽ 30 fps** (`quality.idleFps`): hết cuộn 1,5 s, máy quay đã tới chỗ, tham số đã đứng → nước, gió, thuyền dập dềnh vẫn chạy nhưng nửa số khung. Bóng đổ được cache: vẽ lại mỗi khung khi bận, mỗi 3 khung khi đứng yên.
- Khi màn mở đầu còn che canvas, engine không vẽ. Script dựng cảnh gọi `await world.yield()` giữa các bước nặng để màn mở đầu không đứng hình. Shader được biên dịch trước khi mở màn (song song nếu driver có `KHR_parallel_shader_compile`, từng nhóm một nếu không).
- Kết quả nướng model được cache theo tên + tuỳ chọn (`bakeModel`; có `filter` thì đặt `filterId`). Vật liệu dùng chung (`getPropMaterial`, `getSwayMaterial`) — không tạo vật liệu riêng cho từng loại cây.
- Không cấp phát object trong `update()`: tạo sẵn `Vector3`/`Matrix4` ở ngoài rồi tái sử dụng.
- Chỉ cập nhật `instanceMatrix` khi giá trị thật sự đổi (xem `actors/stakes.ts`).
- Bóng đổ chỉ bật khi `quality.shadows`; cây rừng / bụi ở xa không cần đổ bóng.
- Model GLB < 100 KB mỗi file sau tối ưu. Tổng model của một chương < 1 MB.

**Đo** (Playwright + Chrome, dev server hoặc `pnpm build && pnpm start`): giả lập iPhone (390×844, cảm ứng) với CPU chậm ×4 qua CDP `Emulation.setCPUThrottlingRate`, GPU yếu bằng `--use-angle=swiftshader`; đếm draw call và số đỉnh mỗi lần vẽ bằng cách bọc `drawArraysInstanced` / `drawElements…`, đo fps khi đứng yên và khi đang cuộn, long task lúc dựng cảnh. Số đo ngày 2026-10-16 (Bạch Đằng, bản production): điện thoại (low, CPU ×4) 51–62 draw call, 0,52–0,69 triệu đỉnh mỗi lần vẽ, 60 fps khi cuộn, dựng xong sau 0,9 s, long task lớn nhất 70 ms; điện thoại GPU phần mềm + CPU ×6: 29–40 fps (trước tối ưu 6–7 fps); desktop (high, có bóng đổ) 143–158 draw call, 3,4–4,9 triệu đỉnh.
- Không dùng `backdrop-filter` hay `mix-blend-mode` phủ lên canvas.
- Three.js chỉ được import trong `src/core/engine`, `src/core/world` và `content/*/scene.ts` hoặc `actors`, tức những file chỉ nạp phía client. Không import trong server component.

### Toạ độ & đơn vị

1 đơn vị ≈ 1 mét. Trục Y hướng lên. Model Blender: mũi thuyền hướng `-Y` trong Blender, thành `+Z` trong three.js. Gốc toạ độ đặt ở chân vật thể (hoặc ở đường mớn nước với thuyền).

## 6. Giao diện (`src/core/ui`)

- Component dùng chung: `StoryShell` (khung trang chương), `Hero`, `BeatSection`, `SliderInteraction`, `IntroOverlay`, `TopBar`, `Timeline`, `ChapterEnd`, `SceneStage`, hoa văn trong `ornaments/` (`DongSonDrum`, `DongSonBand`, `Seal`).
- Hook: `useSmoothScroll` (Lenis + ScrollTrigger), `useNarration`, `useAmbient`.
- **Import GSAP từ `@/core/ui/gsap`**, không import thẳng từ `"gsap"`, để plugin được đăng ký đúng một lần. Viết animation trong `useGSAP` để tự dọn khi unmount. Luôn bọc bằng `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`.
- **SplitText với tiếng Việt:** khi dùng `mask`, phải đặt class (`wordsClass: "sw"`, `linesClass: "sl"`, `charsClass: "sc"`). CSS trong `ui.css` nới vùng clip để không cắt dấu (ạ, ặ, ỗ…).
- Style viết trong `src/core/ui/ui.css`, đặt tên kiểu BEM (`.khoi__phan--bien-the`). Màu lấy từ biến CSS trong `globals.css`: `--then`, `--son`, `--vang`, `--giay`… Không viết mã màu lẻ.
- Thẩm mỹ: tông sơn mài (nền then, vàng kim, đỏ son), hoa văn trống đồng Đông Sơn, con dấu son. Chuyển động chậm, mượt, ease `expo.out` / `power3.out`. Tránh hiệu ứng "công nghệ" (neon, glitch).
- Trợ năng: mọi nút có nhãn; tương tác dùng `<input type="range">` thật; tôn trọng `prefers-reduced-motion`; chữ luôn có trong HTML render từ server.

## 7. Công thức thường gặp

### Thêm chương mới

1. `cp -r content/_mau content/NN-<slug>`. `NN` là số thứ tự tiếp theo, `<slug>` khớp với frontmatter.
2. Viết `story.md` theo `content/README.md`. Mỗi phân cảnh có `<!-- id: … | kicker: … -->`.
3. Viết `scene.config.ts`: mỗi `id` một keyframe.
4. Viết `scene.ts`: bắt đầu từ mẫu, dùng lại thành phần trong `src/core/world`.
5. `pnpm content && pnpm typecheck && pnpm build`, rồi `pnpm dev` để xem `/chuong/<slug>`.
6. Để `status: draft` cho tới khi nội dung được thẩm định.

### Thêm tương tác cho một phân cảnh

1. Trong `story.md`: thêm `interaction: <key>@<ngưỡng>` vào dòng chú thích, kèm khối `> [!IMPORTANT]`.
2. Trong `scene.ts`: đọc `ctx.inputs.<key>` (0..1) bên trong `world.resolve` để đổi tham số mục tiêu, và dùng `ctx.completedAt.<key>` để kích hoạt diễn biến sau khi người xem hoàn thành. Xem `content/01-bach-dang-938/scene.ts`.

### Thêm model Blender

1. Tạo `blender/assets/<ten>.py` có hàm `build()`, dùng `vn.mat("<khoá màu>")`, `vn.loft`, `vn.tube`, `vn.blob`, `vn.paint`…
2. Thêm màu mới (nếu cần) vào `PALETTE` trong `blender/lib/vn.py`. Giữ tông trầm, ấm.
3. `pnpm assets <ten>`, rồi xem `blender/previews/<ten>.png`.
4. Dùng trong cảnh: `createProps("<ten>", …)` hoặc `bakeModel("<ten>")`.

### Thêm thành phần cảnh dùng chung

Viết hàm `createX(options): Actor` trong `src/core/world/x.ts`. Mọi giá trị riêng của chương phải đi qua `options`. Thêm một dòng vào bảng ở mục 5 của file này.

## 8. Không được làm

- Thêm thư viện lớn khi đã có công cụ tương đương (ví dụ React Three Fiber, Framer Motion, Tailwind, thư viện state). Cần thêm thì nêu lý do trong PR.
- Đổi API trong `src/core` mà không cập nhật mọi chương đang dùng.
- Xoá hoặc đổi nghĩa tham số trong `scene.config.ts` của chương khác.
- Commit `blender/.raw/`, `.next/`, `node_modules/`.
- Viết nội dung lịch sử không có nguồn, hoặc "làm cho hay hơn" bằng chi tiết bịa.
- Bỏ qua lỗi build bằng `// @ts-ignore` hay `any` khi chưa hiểu nguyên nhân.

## 9. Commit & PR

- Mỗi PR làm một việc rõ ràng: một chương, một tính năng core, hoặc một sửa nội dung.
- Commit theo Conventional Commits, mô tả bằng tiếng Việt: `feat(chuong-02): thêm phân cảnh dời đô`, `fix(core/ui): không cắt dấu tiếng Việt`, `content(bach-dang): bổ sung nguồn`.
- PR sửa nội dung lịch sử phải liệt kê nguồn đã dùng.
- Điền đủ checklist trong `.github/PULL_REQUEST_TEMPLATE.md`.
