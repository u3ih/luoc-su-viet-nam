# Hệ thống thiết kế — "Sơn mài hiện đại"

Đặc tả giao diện của Lược sử Việt Nam. Xem trực tiếp mọi token và component ở trang `/thiet-ke`.

- **Token:** `src/app/globals.css` (biến CSS trên `:root`).
- **Component nền:** `src/core/ui/base/*` và `src/core/ui/ornaments/*`, chỉ import qua `@/core/ui`.
- **Mixin SCSS:** `src/core/ui/styles/_mixins.scss` (`phone`, `motion-ok`, `gold-text`, `control`, `sr-only`, `progress-track`).
- **Kiểm tra:** `pnpm check-ui` (chạy trước `pnpm build`) chặn mọi chỗ viết tay thay vì dùng component nền.

## 1. Định hướng

Trang kể lịch sử nên phải có chất cổ, nhưng người xem là học sinh và người dùng điện thoại hôm nay, nên phải dễ dùng như một sản phẩm hiện đại.

| Cổ — ở chất liệu | Hiện đại — ở bố cục |
|---|---|
| Bảng màu sơn mài: then, son, vàng kim, cánh gián, giấy dó | Lưới thoáng, khung nội dung tối đa `--content` (1200px), lề `--gutter` chung mọi trang |
| Tiêu đề serif (LSVN Display, từ Playfair Display) | Thân chữ sans (Be Vietnam Pro), cỡ 16–17px, dòng 1,7 |
| Hoa văn trống đồng Đông Sơn, con dấu son, hạt giấy dó | Bo góc mềm (`--r-md` 14px), viền mảnh mờ, nổi khối bằng bóng nhẹ |
| Ánh vàng kim trên tiêu đề lớn | Mỗi vùng một hành động chính; chip, ô nhập, nút cùng dáng bo tròn |

### Nguyên tắc

1. **Một điểm son mỗi vùng.** Nút nền son (`Button variant="primary"`) chỉ một cái trong một vùng màn hình. Hành động phụ dùng `default` (viền) hoặc `quiet` (chữ).
2. **Hoa văn là điểm nhấn, không phải nền.** `DongSonBand` dùng dưới tiêu đề phân cảnh, đầu bản chữ, trên chân trang và mở phần cuối chương. Không đặt dưới mọi tiêu đề mục. Mặt trống chỉ dùng ở màn mở đầu, đầu chương và trang chủ. Con dấu chỉ dùng trên thẻ chương và tiêu đề chương.
3. **Ít nhãn chữ hoa.** Dòng chữ hoa giãn cách (`Kicker`) chỉ đứng trên một tiêu đề. Số liệu, nhãn nhóm, chú thích viết thường, màu `--text-muted`.
4. **Ít viền.** Phân khối bằng khoảng trắng trước, rồi tới mặt thẻ (`Card`), sau cùng mới tới đường kẻ (`--border-soft`).
5. **Điện thoại trước.** Vùng chạm ≥ 44px (`--tap`). Hàng chip cuộn ngang sát hai mép. Nút chính rộng hết hàng. Ô nhập 16px để Safari iOS không tự phóng to.
6. **Đọc được trên cảnh 3D.** Chữ đặt trên canvas có màn tối (`scrim`, dải sau `.beat__card` trên điện thoại, `Card tone="veil"`). Không dùng `backdrop-filter` hay `mix-blend-mode` trên canvas.
7. **Chuyển động chậm, có nghĩa.** Ease `--ease-out` (expo), thời lượng `--dur-1/2/3`. Mọi chuyển động tắt khi `prefers-reduced-motion`.

## 2. Token

### Màu — dùng theo vai trò

| Token | Dùng cho |
|---|---|
| `--bg` | nền trang (then) |
| `--surface-1`, `--surface-2` | mặt thẻ, ô nhập; `-2` khi hover/focus |
| `--surface-lacquer` | thẻ nổi bật (chương, hành trình) |
| `--surface-veil` | khối đặt trên cảnh 3D (ôn tập, ghi chú, nguồn, thanh kéo) |
| `--text`, `--text-muted`, `--text-faint` | chữ chính / phụ / mờ (giấy phép, nguồn) |
| `--accent`, `--accent-soft` | vàng kim: nhãn, năm, biểu tượng / vàng nhạt: link, tiêu đề phụ |
| `--action` (`--son`), `--son-sang` | nút chính, mốc "đã có chương" |
| `--border`, `--border-soft`, `--border-strong` | viền thẻ / đường chia / viền khi hover, thẻ hành động |

Bảng màu gốc (`--then`, `--son`, `--vang`, `--giay`…) vẫn giữ để tương thích. Code mới dùng token vai trò. Không viết mã màu lẻ.

### Chữ

| Token | Cỡ | Dùng cho |
|---|---|---|
| `--fs-display` | 3,4 → 8,6rem | tên trang chủ, tên chương ở màn mở đầu |
| `--fs-h1` | 2,6 → 4,6rem | tiêu đề trang (`SectionHead level={1}`) |
| `--fs-h2` | 1,9 → 2,75rem | tiêu đề mục |
| `--fs-h3` | 1,3 → 1,5rem | thời kỳ, mục con |
| `--fs-h4` | 1,2rem | tiêu đề thẻ, khối |
| `--fs-lg` / `--fs-base` / `--fs-sm` / `--fs-xs` | 1,15rem / 17px (16px điện thoại) / 14px / 12px | lời dẫn / thân / phụ / giấy phép |

- Tiêu đề (`h1`–`h4`) dùng `font-family: var(--font-d)` và `text-wrap: balance`. Thân chữ dùng `var(--font-b)`.
- Chữ ánh vàng (`@include gold-text`) chỉ dành cho tiêu đề cấp trang.
- `--lh-tight` (1,06) cho tiêu đề lớn, `--lh-snug` (1,3) cho tiêu đề thẻ, `--lh-body` (1,7) cho thân chữ.

### Khoảng cách, khung

- Bậc 4px: `--s-1` 4 · `--s-2` 8 · `--s-3` 12 · `--s-4` 16 · `--s-5` 24 · `--s-6` 32 · `--s-7` 48 · `--s-8` 64 · `--s-9` 96.
- `--section-y`: khoảng cách giữa các mục lớn (64 → 120px).
- `--gutter`: lề trái/phải của trang (20px trên điện thoại). `--gutter-bar`: lề thanh trên.
- `--content` (1200px): bề rộng tối đa của khung nội dung. `--measure` (42rem): bề rộng tối đa của đoạn văn.

### Bo góc, nổi khối, chuyển động

- `--r-sm` 8px (ghi chú, dòng danh sách) · `--r-md` 14px (thẻ, khối) · `--r-lg` 20px · `--r-pill` (nút, chip, ô nhập).
- `--shadow-1`: thẻ đứng yên. `--shadow-2`: thẻ khi hover, thẻ hành động.
- `--dur-1` 0,2s (màu) · `--dur-2` 0,4s (viền, nền) · `--dur-3` 0,8s (dịch chuyển). Ease `--ease-out`.

## 3. Component nền (`@/core/ui`)

| Component | Khi nào dùng | Ghi chú |
|---|---|---|
| `Link` | mọi link | link ngoài tự mở tab mới; link trong có màn khép điện ảnh (`iris={false}` để tắt) |
| `useNavigate()` | chuyển trang bằng code | thay cho `useRouter` của next, có cùng màn khép |
| `Button` | hành động | `variant`: `primary` (son, một cái mỗi vùng) · `default` (viền) · `quiet` (chữ). `size`: `md` / `sm`. `block` rộng hết hàng. Có `href` thì thành link |
| `Chip` | lọc, bật/tắt, link phụ dạng viên | `on`, `count`, `icon`, `ghost`; có `href` thì thành link. Trên thanh trên, điện thoại chỉ hiện biểu tượng |
| `ChipRow` | một hàng chip | cuộn ngang, sát mép trên điện thoại; `wrap` để xuống dòng ở màn rộng |
| `Segmented` | chọn một trong vài kiểu xem | `options`, `value`, `onChange` |
| `SearchField` | ô tìm | nhãn ẩn cho trình đọc màn hình (`showLabel` để hiện) |
| `Field` + `Input` / `Select` | ô nhập có nhãn | cùng dáng với `SearchField` (`@include control`) |
| `Card` | mọi khối dạng thẻ | `tone`: `plain` / `lacquer` / `veil`; `interactive` khi cả thẻ là link: đặt `data-cover` trên link chính, `data-above` trên link phụ; `accent`, `pad` |
| `SectionHead` | đầu mọi trang và mục | `kicker` → `title` → `lead`, `action` bên phải; `level` 1/2/3 |
| `Disclosure` | nội dung phụ thu gọn | `<details>`; nội dung vẫn có trong HTML |
| `Tag` | nhãn nhỏ không bấm được | `tone`: `muted` / `gold` / `son` |
| `Kicker` | dòng nhãn chữ hoa trên tiêu đề | mỗi tiêu đề tối đa một |
| `Icon` | biểu tượng nét mảnh | thêm vào `base/Icon.tsx`; danh sách: `iconNames` |
| `Image` | ảnh | bắt buộc `alt`; ảnh hiện vật ghi nguồn và giấy phép |
| `DongSonBand`, `DongSonDrum`, `Seal`, `Star` | hoa văn | đúng hiện vật — xem chú thích nguồn trong `ornaments/` |

### Không được

`pnpm check-ui` báo lỗi khi gặp các trường hợp sau (ngoài `base/` và `ornaments/`):

- import thẳng `next/link`, `next/image`, `next/script`, `next/head`, `next/form`, hook `useRouter`/`usePathname`/`useSearchParams` của `next/navigation`, hoặc import thẳng file trong `base/`/`ornaments/`;
- viết thẻ `<a>`, `<img>`, `<svg>`, `<details>`, `<select>`, `<input type="search">`;
- tự viết lớp `.btn`, `.chip`, `.kicker`.

Ngoại lệ thuộc lớp khung: `next/dynamic` (Next cần `import()` nằm ngay trong lời gọi `dynamic()` để tải trước, nên không bọc được), `next/font` (layout), `next/og` (ảnh chia sẻ), `notFound` trong route.

Thiếu kiểu nào thì thêm biến thể vào component nền, đừng viết tay ở chỗ dùng.

## 4. Mẫu bố cục

**Trang thường** (trang chủ, lộ trình, phương pháp, cần giúp, thiết kế):

```
TopBar scrolls
header  → SectionHead level={1} (kicker · tiêu đề ánh vàng · lời dẫn)
section → khung --content, cách nhau --section-y
          SectionHead level={2} → nội dung (lưới Card, danh sách, bộ lọc)
footer  → DongSonBand mờ · thương hiệu + liên kết · giấy phép
```

**Danh sách dài có bộ lọc:** `SearchField` + `Segmented` trên một hàng, `ChipRow` thời kỳ bên dưới. Thanh này dính ở màn rộng và không dính trên điện thoại. Số đếm và nút "Xoá bộ lọc" chỉ hiện khi đang lọc.

**Thẻ chương:** năm (vàng, serif nhỏ) → tên chương (serif, là link phủ cả thẻ) → 2 dòng giới thiệu → chân thẻ: tiến độ · "Bản chữ" · mũi tên tròn. Con dấu ở góc phải trên. Không lặp lại tên thời kỳ trên thẻ.

**Trang chương (trên cảnh 3D):** chữ phân cảnh luôn có màn tối phía sau. Thứ tự phần cuối chương: ôn tập → chương tiếp theo (thẻ viền vàng, hành động chính) → chương trước / xem lại (chữ) → đọc tiếp (chip) → nguồn (`Card veil`) → liên kết (chip có biểu tượng) → một dòng chữ nhỏ gồm lưu ý AI và giấy phép.

**Sự kiện trên lộ trình:** năm · tiêu đề (+ `Tag` truyền thuyết) · mô tả · nguồn (một dòng) · hành động ("Xem chương" hoặc "Nhận viết") · địa danh thu trong `Disclosure`.

## 5. Kiểm tra trước khi xong việc

- `pnpm check-ui && pnpm typecheck && pnpm build`.
- Xem ở 390px và 1440px: không tràn ngang; vùng chạm ≥ 44px; chữ trên cảnh 3D đọc được.
- Tab qua trang: mọi phần tử có viền focus (`:focus-visible` vàng nhạt).
- Bật `prefers-reduced-motion`: không còn chuyển động trang trí.
