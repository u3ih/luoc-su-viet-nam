# Nội dung các chương

Mỗi chương là một thư mục, **tên thư mục trùng `slug`** (không đánh số thứ tự). Các chương tự xếp theo thời gian dựa vào `sortYear` — muốn chèn một sự kiện vào giữa hai chương có sẵn, chỉ cần ghi năm cho đúng.

```
content/
├── bach-dang-938/
│   ├── story.md          ← lời kể (bản chữ — đọc thẳng trên GitHub)
│   ├── scene.config.ts   ← máy quay + tham số cho từng phân cảnh
│   ├── scene.ts          ← dựng cảnh 3D
│   ├── terrain.ts        ← (tuỳ chương) địa hình
│   └── actors/           ← (tuỳ chương) thành phần cảnh riêng
├── _mau/                 ← thư mục mẫu để chép khi tạo chương mới
├── lo-trinh.md           ← lộ trình: mọi sự kiện lịch sử theo thời gian, có toạ độ (trang /lo-trinh)
└── registry.generated.ts ← tự sinh, đừng sửa tay
```

**Người viết sử chỉ cần làm việc với `story.md`.** Hai file `.ts` dành cho người dựng cảnh 3D. Hai việc này có thể do hai người khác nhau làm.

---

## 1. `story.md` — lời kể

File Markdown bình thường: GitHub hiển thị như một bài viết, có nút **▶ Xem trực quan** dẫn tới bản 3D. Web đọc chính file này để hiện chữ, nên chỉ cần sửa ở một chỗ.

### Phần đầu (frontmatter)

```yaml
---
slug: bach-dang-938          # mã chương: chữ thường không dấu, số, gạch ngang → /chuong/bach-dang-938
title: Bạch Đằng
year: "938"                  # năm hiển thị, chữ tự do ("938", "Thế kỷ III TCN", "Truyền thuyết"); số thì để trong ngoặc kép
sortYear: 938                # năm để xếp thứ tự (số; âm = trước Công nguyên, vd. -257)
era: Kết thúc Bắc thuộc
teaser: Một câu giới thiệu, hiện ở trang chủ.
status: ready                # draft = ẩn khỏi trang chủ; ready = hiện
disclaimer: Bản thử nghiệm…  # (không bắt buộc) dòng lưu ý cuối chương
seal: [Bạch, Đằng]           # (không bắt buộc) chữ trên con dấu son; mặc định: chữ đầu tiêu đề + năm
hero-drum: false             # (không bắt buộc) bỏ mặt trống đồng ở màn mở đầu — dùng cho chương trước thời Đông Sơn
---
```

"Chương tiếp theo" ở cuối chương được tính tự động: chương đã sẵn sàng kế tiếp theo `sortYear`, hoặc sự kiện kế tiếp trong `lo-trinh.md` đang chờ người viết.

### Phần mở đầu

```md
# Bạch Đằng (938)

[![▶ Xem trực quan](…badge…)](https://luocsu.u3ih.io.vn/chuong/bach-dang-938)

_Lời dẫn in nghiêng — hiện dưới tiêu đề lớn trên web._
```

Nhớ đổi đường dẫn trong nút cho đúng `slug`.

### Phân cảnh

Mỗi phân cảnh bắt đầu bằng tiêu đề `##`, **ngay dòng dưới** là một dòng chú thích `<!-- … -->`. GitHub không hiển thị dòng này, còn web dùng nó để biết cách trình bày.

```md
## Bãi cọc dưới lòng sông
<!-- id: bai-coc | kicker: Mưu kế -->

Đoạn văn thứ nhất.

Đoạn văn thứ hai.
```

| Khoá | Bắt buộc | Ý nghĩa |
|---|---|---|
| `id` | ✔ | Mã phân cảnh, không dấu, không trùng. Khớp với keyframe trong `scene.config.ts`. |
| `kicker` | ✔ | Dòng nhỏ phía trên tiêu đề (năm, địa danh, "Mưu kế"…). |
| `layout` |  | `hero` (phân cảnh mở đầu), `left`, `right`, `center`. Mặc định xen kẽ trái/phải. |
| `narration` |  | Lời đọc riêng cho giọng kể. Mặc định đọc tiêu đề + các đoạn văn. Số, số La Mã sau "thế kỷ"/"chương", "TCN", "km"… được tự đổi sang chữ trước khi đọc (`src/core/audio/speakable.ts`), cứ viết như văn bản thường. Khi bật "Nghe kể", trang tự cuộn sang phân cảnh sau mỗi khi đọc xong. |
| `audio` |  | File thu âm sẵn, ví dụ `/audio/bach-dang-938/bai-coc.mp3`. Có file này thì không dùng giọng máy. |
| `interaction` |  | Tương tác dạng `khoá@ngưỡng`, ví dụ `drain@0.85` (xem bên dưới). |

Các khoá cách nhau bằng dấu `|`.

### Ghi chú "Bạn có biết?"

```md
> [!TIP]
> **Con nước ở cửa Bạch Đằng**
>
> Vùng biển này có chế độ nhật triều…
```

### Trích dẫn / lời bình

```md
> Sử thần Lê Văn Hưu cho rằng…
>
> — Đại Việt sử ký toàn thư (diễn ý)
```

Thêm `(diễn ý)` khi bạn thuật lại ý chứ không chép nguyên văn. Web sẽ không đặt ngoặc kép và ghi nhãn "diễn ý".

### Tương tác

Khai báo `interaction: drain@0.85` trong dòng chú thích, rồi thêm khối:

```md
> [!IMPORTANT]
> **Tương tác:** Triều lên ↔ Triều rút · Kéo sang phải để nước rút
>
> Lời kể hiện ra khi người xem hoàn thành tương tác.
```

- `Triều lên ↔ Triều rút`: nhãn hai đầu thanh kéo.
- Sau dấu `·`: lời gợi ý.
- Đoạn văn sau đó: lời kể khi người xem kéo qua ngưỡng (ở đây là 0.85).

Cảnh 3D đọc giá trị qua `ctx.inputs.drain` (từ 0 đến 1).

### Nguồn tham khảo

```md
## Nguồn tham khảo

- Đại Việt sử ký toàn thư, phần Ngoại kỷ (Ngô Sĩ Liên và các sử thần, 1479).
```

---

## 2. Quy tắc nội dung lịch sử

1. **Có nguồn.** Mọi sự kiện, con số, tên người, tên đất đều phải truy được về ít nhất một nguồn trong mục "Nguồn tham khảo". Ưu tiên chính sử và công trình khảo cổ hoặc nghiên cứu đã công bố.
2. **Không bịa.** Nếu cần lời kể giàu hình ảnh, chỉ tả bối cảnh có thật (con nước, mùa, địa hình). Không đặt lời vào miệng nhân vật lịch sử.
3. **Phân biệt sử và truyền thuyết.** Khi kể truyền thuyết, nói rõ "tương truyền", "theo truyền thuyết".
4. **Nêu chỗ còn tranh luận.** Ví dụ vị trí chính xác của trận năm 938.
5. **Không chép dài.** Bản dịch sử liệu hiện đại có thể còn bản quyền. Hãy diễn ý; nếu trích nguyên văn thì chỉ trích ngắn và ghi nguồn.
6. **Văn phong:** câu ngắn, rõ, có nhịp kể, hợp để đọc thành tiếng. Mỗi phân cảnh nên có 1–3 đoạn, mỗi đoạn dưới 60 chữ.

---

## 3. `scene.config.ts` — máy quay

```ts
const config: SceneConfig = {
  params: { tide: 0, fleet: 0 },            // giá trị khởi đầu của mọi tham số
  keyframes: {
    "bai-coc": {
      cam: [33, 5.5, -46],                   // vị trí máy quay (x, y, z)
      look: [0, -1.4, -24],                  // điểm máy quay nhìn vào
      mood: MOOD.overcast,                   // dawn | overcast | sunset | night | day; số lẻ = pha trộn
      fov: 50,                               // (tuỳ chọn) góc nhìn
      params: { tide: -2.6 },                // chỉ ghi tham số thay đổi; tham số khác giữ giá trị của phân cảnh trước
    },
  },
};
```

Khi người xem cuộn trang, máy quay bay theo đường cong mượt qua các keyframe. Các tham số được nội suy và làm mượt tự động.

Khi build, hệ thống báo lỗi nếu một `id` thiếu keyframe hoặc có keyframe thừa.

## 4. `scene.ts` — dựng cảnh

Hàm `setup(world)` thêm các thành phần vào cảnh. Xem `_mau/scene.ts` (tối giản) và `05-bach-dang-938/scene.ts` (đầy đủ). Hướng dẫn chi tiết cho người lập trình và AI agent nằm trong [`AGENTS.md`](../AGENTS.md).

## 5. Tạo chương mới

```bash
cp -r content/_mau content/chieu-doi-do-1010
# sửa story.md (slug, nội dung), scene.config.ts (keyframe cho từng id)
pnpm content   # cập nhật registry
pnpm dev       # xem tại http://localhost:3000/chuong/chieu-doi-do-1010
```
