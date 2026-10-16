# Phông chữ tự lưu trữ

Phông được lưu trong repo và nạp bằng `next/font/local`, nên lúc build không phải tải gì từ Google Fonts.
Trước đây dùng `next/font/google` và build thỉnh thoảng hỏng: Google đôi khi trả URL dạng `/l/font?kit=…&…`, Turbopack đọc sai và báo lỗi `next/font/google queries have exactly one entry` (xem [vercel/next.js#99114](https://github.com/vercel/next.js/issues/99114)).

| File | Nguồn | Giấy phép |
|---|---|---|
| `lsvn-display.woff2` | Playfair Display `PlayfairDisplay[wght].ttf`, [google/fonts](https://github.com/google/fonts/tree/main/ofl/playfairdisplay) (v1.203) | SIL OFL 1.1, `OFL-PlayfairDisplay.txt` |
| `BeVietnamPro-{Regular,Medium,SemiBold}.woff2` | [google/fonts](https://github.com/google/fonts/tree/main/ofl/bevietnampro) | SIL OFL 1.1, `OFL-BeVietnamPro.txt` |

Các phông đã được rút gọn còn bộ ký tự `latin` và `vietnamese` (giống các subset trước đây lấy từ Google), đồng thời bỏ hinting.
Playfair Display có Reserved Font Name. Theo OFL FAQ 2.6, cắt bớt glyph được tính là bản sửa đổi, nên bản rút gọn phải đổi tên họ phông thành **LSVN Display**.
Bản quyền (nameID 0) và nhãn hiệu (nameID 7) giữ nguyên. Trục `wght` được thu lại còn 600–800.

## Dựng lại

```bash
python3 -m venv .venv && .venv/bin/pip install fonttools brotli
U="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD,U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303,U+0309,U+0323,U+1EA0-1EF9,U+20AB"

# Playfair Display → LSVN Display (thu trục wght, đổi tên, rút gọn)
.venv/bin/fonttools varLib.instancer "PlayfairDisplay[wght].ttf" wght=600:800 -o pf.ttf
.venv/bin/python -c "
from fontTools.ttLib import TTFont
f = TTFont('pf.ttf')
for r in f['name'].names:
    if r.nameID not in (0, 7, 8, 9, 11, 12, 13, 14):
        r.string = r.toUnicode().replace('Playfair Display', 'LSVN Display').replace('PlayfairDisplay', 'LSVNDisplay')
f.save('pf.ttf')"
.venv/bin/pyftsubset pf.ttf --unicodes="$U" --no-hinting --desubroutinize --flavor=woff2 --output-file=lsvn-display.woff2

# Be Vietnam Pro
for n in Regular Medium SemiBold; do
  .venv/bin/pyftsubset "BeVietnamPro-$n.ttf" --unicodes="$U" --no-hinting --desubroutinize --flavor=woff2 --output-file="BeVietnamPro-$n.woff2"
done
```
