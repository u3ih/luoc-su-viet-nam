# Model 3D (Blender)

Model trong dự án được **sinh bằng script Python**: dễ review, dễ sửa, dễ đồng bộ phong cách. Model làm tay bằng file `.blend` cũng dùng được.

```
blender/
├── lib/vn.py            thư viện dựng hình + BẢNG MÀU (PALETTE) dùng chung
├── assets/<ten>.py      mỗi file một model — có hàm build()
├── sources/<ten>.blend  model làm tay (tuỳ chọn)
├── run.py               chạy một asset → GLB (+ ảnh preview)
└── previews/<ten>.png   ảnh xem trước (tự render bằng EEVEE)
```

## Dựng model

```bash
pnpm assets                  # tất cả (bản đầy đủ + bản lite)
pnpm assets thuyen_ngo coc   # chỉ vài model
pnpm assets --lite           # chỉ dựng lại các bản lite
BLENDER_BIN=/duong/dan/blender pnpm assets   # nếu Blender không ở chỗ mặc định
```

Script chạy Blender ở chế độ nền, xuất GLB, tối ưu bằng gltf-transform (meshopt) rồi ghi ra `public/models/<ten>.glb`. Nhớ commit cả `.py`, `.glb` và ảnh preview.

## Bản lite (bắt buộc với cây lá, thuyền, núi đá)

Máy yếu và đạo cụ ở xa dùng bản lite `public/models/<ten>.lite.glb`. Script nào gọi `lod(…)` hoặc đọc `LITE` (từ `vn`) sẽ được dựng thêm một lần với `VN_LITE=1`; danh sách ghi vào `public/models/lite.json` để web không gọi file không tồn tại.

```python
from vn import LITE, lod

for i in range(lod(16, 9)):          # ít thân / ít cụm lá hơn
    ...
s = 0.28 * lod(1.0, 1.45)            # bù kích thước để bóng dáng tổng thể giữ nguyên
```

`tube()` tự giảm số cạnh và `subdivide()` tự bỏ qua ở bản lite. Giữ **bóng dáng** giống bản đầy đủ (ô cây đổi LOD ở xa không được "nhảy" hình); bớt những gì nhìn xa không thấy: đốt cây, lá chét, số vòng thân thuyền. `gltf-transform simplify` không giúp được với lá rời từng tấm — phải giảm ngay trong script.

## Quy ước

- **Đơn vị:** 1 = 1 mét. Trục Z hướng lên (khi xuất sẽ tự đổi sang Y-up).
- **Hướng:** mũi thuyền chỉ về **-Y**.
- **Gốc toạ độ:** chân vật thể; thuyền thì đặt ở đường mớn nước.
- **Màu:** chỉ dùng khoá màu trong `PALETTE` qua `mat("go")`, `mat("son")`…; màu chuyển dần thì dùng `vcol_mat()` + `paint()`. Không dùng texture ảnh: web gộp mỗi model thành một khối màu đỉnh để vẽ hàng loạt.
- **Dung lượng:** dưới 100 KB mỗi model sau tối ưu. Low-poly có chủ đích, bo mượt bằng `subdivide()` ở chỗ cần.
- **Tên object:** đặt có nghĩa (`than`, `buom0`…). Model có nhiều biến thể thì đặt tên biến thể rõ ràng (`da_voi_0`, `da_voi_1`…) để cảnh lọc bằng `bakeModel(name, { filter })`.

## Phong cách

Hướng tới cảm giác **tranh sơn mài và hoa văn Đông Sơn**: màu trầm ấm (then, nâu cánh gián, đỏ son, vàng kim), khối giản lược nhưng giàu chi tiết nhận diện:

- Thuyền quân Ngô: mũi đầu chim, chiến binh đội mũ lông chim, trống đồng, mắt thuyền.
- Làng quê: nhà tranh mái rạ, cây cau, bụi tre, bụi chuối, rào tre, đống rơm.

**Chính xác lịch sử là trên hết.** Khi thêm vật thể của một thời kỳ, ghi nguồn tham khảo hình ảnh (hiện vật, hình khắc, công trình nghiên cứu) trong docstring đầu file.

## Model hiện có

| Model | Mô tả |
|---|---|
| `thuyen_ngo` | thuyền chiến nhẹ quân Ngô (dáng thuyền trên trống đồng Đông Sơn) |
| `thuyen_nam_han` | thuyền chiến lớn Nam Hán, buồm cánh dơi |
| `coc` | cọc gỗ đẽo nhọn bịt sắt |
| `nui_da_voi` | 3 biến thể núi đá vôi có cây bám đỉnh |
| `nha_tranh` | nhà tranh vách đất |
| `bui_tre`, `cay_cau`, `bui_chuoi`, `cay_bang` | cây cối làng quê |
| `rao_tre`, `dong_rom` | rào tre, đống rơm |
