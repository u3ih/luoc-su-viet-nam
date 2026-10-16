# Dữ liệu bản đồ

Dùng cho bản đồ 3D ở trang [/lo-trinh](https://luocsu.u3ih.io.vn/lo-trinh).

## `ne-10m-vn.json` — đường biên giới, bờ biển

- Nguồn: **Natural Earth** 1:10m, bộ "Admin 0 – Countries" theo **góc nhìn Việt Nam** (`ne_10m_admin_0_countries_vnm`, phiên bản 5.1.1) — https://www.naturalearthdata.com/
- Giấy phép: **public domain** (Natural Earth cho phép dùng tự do, không cần ghi công; vẫn ghi ở đây để minh bạch).
- Bản góc nhìn Việt Nam thể hiện **quần đảo Hoàng Sa và Trường Sa** thuộc lãnh thổ Việt Nam.
- Đã xử lý: chỉ giữ Việt Nam và các nước lân cận (cắt theo khung kinh độ 97,5–119°E, vĩ độ 5,5–26,5°N), rút gọn đường nét bằng thuật toán Douglas–Peucker (≈ 400 m với đất liền Việt Nam, ≈ 3 km với nước lân cận), làm tròn toạ độ 3 chữ số thập phân.
- Định dạng: `{ "VNM": [vòng, …], "CHN": …, … }`, mỗi vòng là mảng `[kinh độ, vĩ độ]` khép kín.

## `dia-danh.json` — địa danh

- `tinh`: 34 tỉnh, thành phố theo Nghị quyết 202/2025/QH15 của Quốc hội (hiệu lực 01/7/2025), đặt tại trung tâm hành chính.
- `dao`: một số đảo, huyện đảo; `quanDao`: quần đảo Hoàng Sa (thành phố Đà Nẵng) và Trường Sa (tỉnh Khánh Hoà) cùng một số đảo chính.
- `bien`, `nuoc`: nhãn vùng biển và nước láng giềng.
- Toạ độ lấy gần đúng từ bản đồ số, đủ để đặt nhãn; không dùng để đo đạc.

## `tinh.json`, `xa/<tinh>.json` — ranh giới tỉnh và xã/phường

- Nguồn: **OpenStreetMap**, quan hệ `boundary=administrative` cấp 4 (34 tỉnh/thành) và cấp 6 (xã/phường/đặc khu) sau sắp xếp đơn vị hành chính ngày 01/7/2025, tải qua Overpass API.
- Giấy phép: **ODbL 1.0** — © OpenStreetMap contributors (https://www.openstreetmap.org/copyright). Bản đồ trang /lo-trinh ghi công ở góc bản đồ.
- Đủ 3.321 đơn vị cấp xã (2.621 xã, 687 phường, 13 đặc khu). OSM chưa có ranh giới **Đặc khu Hoàng Sa** (thành phố Đà Nẵng): script dựng đặc khu này từ các đảo trong dữ liệu Natural Earth góc nhìn Việt Nam (trường `bosung`), và làm tương tự cho Đặc khu Trường Sa (tỉnh Khánh Hòa) nếu OSM thiếu.
- Dữ liệu cộng đồng nên có thể lệch đôi chút so với văn bản chính thức.
- Dựng lại: `pnpm geo` (scripts/geo-osm.mjs: tải, ghép vòng, rút gọn ≈ 65 m với xã, ≈ 400 m với tỉnh; rồi scripts/geo-dia-chi.mjs ghi địa chỉ hiện nay vào content/lo-trinh.md).
- Định dạng: `tinh.json` = `[{ ten, slug, bbox: [vĩ độ min, kinh độ min, vĩ độ max, kinh độ max], r: [vòng phẳng [kinh độ, vĩ độ, …]] }]`; `xa/<slug>.json` = `{ tinh, xa: [{ ten, c: [vĩ độ, kinh độ] (tâm), r }] }`.

## `do-cao.png` — độ cao địa hình

- Nguồn: **ETOPO1** (NOAA National Centers for Environmental Information), tải qua dịch vụ ERDDAP của NOAA (bộ `etopo180`), cắt khung 5,5–26,5°N, 97,5–119°E, bước 2 phút cung (~3,7 km).
- Giấy phép: dữ liệu của Chính phủ Hoa Kỳ — **public domain**. Trích dẫn: NOAA National Geophysical Data Center, 2009: ETOPO1 1 Arc-Minute Global Relief Model.
- Mã hoá: ảnh xám 8 bit, hàng đầu là phía bắc; giá trị v → độ cao (v/255)² × 3200 m (căn bậc hai để đồng bằng vẫn có bậc); biển và vùng dưới 0 m = 0. Bản đồ phóng đại chiều đứng khoảng 11 lần cho núi rõ khối.
