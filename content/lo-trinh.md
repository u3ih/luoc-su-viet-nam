# Lộ trình các sự kiện lịch sử Việt Nam

Danh sách sự kiện theo thời gian — bản đồ để cộng đồng chọn và viết tiếp các chương. Trang web hiển thị file này tại [/lo-trinh](https://luocsu.u3ih.io.vn/lo-trinh).

**Cách sửa:** mỗi sự kiện là một dòng:

```md
- **938** · Chiến thắng Bạch Đằng — Mô tả một câu. <!-- sort: 938 | chuong: bach-dang-938 | noi: Sông Bạch Đằng | toa-do: 20.93, 106.77 | truoc-2025: giữa thị xã Quảng Yên (Quảng Ninh) và huyện Thuỷ Nguyên (Hải Phòng) | nay: Phường Phong Cốc, Thành phố Quảng Ninh -->
```

- `sort` (bắt buộc): năm dùng để xếp thứ tự; số âm là trước Công nguyên. Niên đại chưa chắc chắn thì ghi năm ước lượng.
- `chuong` (tuỳ chọn): slug của chương đã viết về sự kiện này.
- `truyen-thuyet` (tuỳ chọn): đánh dấu là truyền thuyết.
- `ten-xua` (tuỳ chọn): tên gọi xưa trong sử sách (Phong Khê, Tống Bình, Phú Xuân…).
- `truoc-2025` (tuỳ chọn): địa chỉ hành chính trước khi sắp xếp đơn vị hành chính ngày 01/7/2025.
- `nay`: địa chỉ hiện nay (xã/phường, tỉnh/thành) — **tự sinh** từ toạ độ bằng `python3 scripts/geo-dia-chi.py`, đừng sửa tay.
- `noi` và `toa-do` (tuỳ chọn): địa danh gắn với sự kiện và toạ độ "vĩ độ, kinh độ" để cắm mốc trên bản đồ. Toạ độ chỉ cần gần đúng (lấy từ bản đồ số); địa danh cổ chưa rõ vị trí thì để trống.

Danh sách chỉ ghi những mốc đã được sử sách và giới nghiên cứu ghi nhận rộng rãi. Mô tả ngắn gọn để định hướng, chưa thay cho phần thẩm định nguồn khi viết chương. Thấy thiếu hay sai, hãy mở góp ý kèm nguồn.

## Thời tiền sử

Những dấu tích con người sớm nhất trên đất Việt Nam, từ thời đồ đá đến thời đồ đồng.

- **Thời đồ đá cũ** · Người tối cổ ở núi Đọ — Di chỉ núi Đọ (Thanh Hoá) có nhiều công cụ đá ghè đẽo thô sơ của người thời đồ đá cũ. <!-- sort: -300000 | noi: Núi Đọ, Thanh Hoá | toa-do: 19.93, 105.68 | truoc-2025: Thiệu Hoá và TP. Thanh Hoá, tỉnh Thanh Hoá | nay: Xã Thiệu Hóa, Tỉnh Thanh Hóa -->
- **Thời đồ đá cũ muộn** · Văn hoá Sơn Vi — Những nhóm người săn bắt, hái lượm sống ở vùng đồi trung du và thềm sông Bắc Bộ, Bắc Trung Bộ. <!-- sort: -20000 | noi: Sơn Vi, Phú Thọ | toa-do: 21.32, 105.29 | truoc-2025: xã Sơn Vi, huyện Lâm Thao, tỉnh Phú Thọ | nay: Xã Lâm Thao, Tỉnh Phú Thọ -->
- **Thời đồ đá giữa** · Văn hoá Hoà Bình — Cư dân sống trong hang động, mái đá vùng núi đá vôi; được xem là một trong những nền văn hoá tiêu biểu của Đông Nam Á thời ấy. <!-- sort: -12000 | noi: Hoà Bình | toa-do: 20.82, 105.34 | truoc-2025: tỉnh Hoà Bình | nay: Phường Hòa Bình, Tỉnh Phú Thọ -->
- **Thời đồ đá mới** · Văn hoá Bắc Sơn — Rìu đá mài lưỡi, đồ gốm thô; con người bắt đầu biết trồng trọt sơ khai. <!-- sort: -8000 | noi: Bắc Sơn, Lạng Sơn | toa-do: 21.90, 106.32 | truoc-2025: huyện Bắc Sơn, tỉnh Lạng Sơn | nay: Xã Bắc Sơn, Tỉnh Lạng Sơn -->
- **Khoảng 4.000 năm trước** · Văn hoá Phùng Nguyên — Cư dân nông nghiệp trồng lúa định cư ở trung du, đồng bằng Bắc Bộ; mở đầu thời kỳ tiền Đông Sơn. <!-- sort: -2000 | noi: Phùng Nguyên, Phú Thọ | toa-do: 21.30, 105.33 | truoc-2025: xã Kinh Kệ, huyện Lâm Thao, tỉnh Phú Thọ | nay: Xã Bản Nguyên, Tỉnh Phú Thọ -->
- **Thiên niên kỷ I TCN** · Văn hoá Sa Huỳnh và Đồng Nai — Ở miền Trung và Nam Bộ, các nền văn hoá kim khí phát triển song song với văn hoá Đông Sơn ở phía bắc. <!-- sort: -500 | noi: Sa Huỳnh, Quảng Ngãi | toa-do: 14.67, 109.06 | truoc-2025: thị xã Đức Phổ, tỉnh Quảng Ngãi | nay: Phường Sa Huỳnh, Tỉnh Quảng Ngãi -->

## Thời dựng nước

Từ truyền thuyết Hồng Bàng đến nhà nước Văn Lang, Âu Lạc.

- **Truyền thuyết** · Con Rồng cháu Tiên — Lạc Long Quân và Âu Cơ sinh bọc trăm trứng; người con trưởng làm vua Hùng, lập nước Văn Lang. <!-- sort: -700 | chuong: con-rong-chau-tien | truyen-thuyet | noi: Đền Hùng, Phú Thọ | toa-do: 21.37, 105.32 | ten-xua: Phong Châu | truoc-2025: xã Hy Cương, TP. Việt Trì, tỉnh Phú Thọ | nay: Xã Hy Cương, Tỉnh Phú Thọ -->
- **Khoảng thế kỷ VII TCN** · Nhà nước Văn Lang và văn hoá Đông Sơn — Nhà nước đầu tiên của người Việt theo hiểu biết hiện nay; thời của trống đồng, nỏ, lúa nước. <!-- sort: -690 | noi: Đông Sơn, Thanh Hoá | toa-do: 19.80, 105.73 | truoc-2025: phường Hàm Rồng, TP. Thanh Hoá, tỉnh Thanh Hoá | nay: Phường Đông Sơn, Tỉnh Thanh Hóa -->
- **Truyền thuyết** · Thánh Gióng — Cậu bé làng Phù Đổng vươn vai thành tráng sĩ, đánh tan giặc Ân. <!-- sort: -680 | truyen-thuyet | noi: Phù Đổng, Hà Nội | toa-do: 21.05, 105.96 | truoc-2025: xã Phù Đổng, huyện Gia Lâm, Hà Nội | nay: Xã Phù Đổng, Thành phố Hà Nội -->
- **Truyền thuyết** · Sơn Tinh, Thủy Tinh — Câu chuyện về cuộc chiến chống lũ lụt của cư dân đồng bằng sông Hồng. <!-- sort: -660 | truyen-thuyet | noi: Núi Ba Vì | toa-do: 21.06, 105.37 | ten-xua: Núi Tản Viên | truoc-2025: huyện Ba Vì, Hà Nội | nay: Xã Ba Vì, Thành phố Hà Nội -->
- **Khoảng 218 – 208 TCN** · Kháng chiến chống quân Tần — Người Việt rút vào rừng, đánh lâu dài, khiến quân Tần sa lầy và chủ tướng Đồ Thư bị giết. <!-- sort: -218 -->
- **Thế kỷ III TCN** · Nước Âu Lạc, thành Cổ Loa — Thục Phán An Dương Vương lập nước Âu Lạc, đóng đô và đắp thành ở Cổ Loa. <!-- sort: -257 | chuong: co-loa | noi: Cổ Loa, Hà Nội | toa-do: 21.115, 105.873 | ten-xua: Phong Khê | truoc-2025: xã Cổ Loa, huyện Đông Anh, Hà Nội | nay: Xã Đông Anh, Thành phố Hà Nội -->
- **Khoảng 179 TCN** · Triệu Đà chiếm Âu Lạc — Âu Lạc bị sáp nhập vào nước Nam Việt; thời kỳ Bắc thuộc bắt đầu. <!-- sort: -179 | noi: Cổ Loa, Hà Nội | toa-do: 21.115, 105.873 | ten-xua: Phong Khê | truoc-2025: xã Cổ Loa, huyện Đông Anh, Hà Nội | nay: Xã Đông Anh, Thành phố Hà Nội -->

## Thời Bắc thuộc và các cuộc khởi nghĩa

Hơn một nghìn năm chịu ách đô hộ của các triều đại phương Bắc, xen giữa những cuộc khởi nghĩa giành lại quyền tự chủ.

- **111 TCN** · Nhà Hán đặt ách đô hộ — Nhà Hán diệt Nam Việt, chia đất Âu Lạc cũ thành các quận Giao Chỉ, Cửu Chân, Nhật Nam. <!-- sort: -111 -->
- **Thế kỷ I** · Vương quốc Phù Nam — Ở vùng Nam Bộ hình thành vương quốc Phù Nam, gắn với văn hoá Óc Eo và thương cảng buôn bán đường biển. <!-- sort: 60 | noi: Óc Eo, An Giang | toa-do: 10.25, 105.15 | truoc-2025: thị trấn Óc Eo, huyện Thoại Sơn, tỉnh An Giang | nay: Xã Óc Eo, Tỉnh An Giang -->
- **40 – 43** · Khởi nghĩa Hai Bà Trưng — Trưng Trắc, Trưng Nhị dấy binh ở Mê Linh, lấy được sáu mươi lăm thành, xưng vương. <!-- sort: 40 | chuong: hai-ba-trung-40 | noi: Mê Linh, Hà Nội | toa-do: 21.18, 105.72 | ten-xua: Huyện Mê Linh, quận Giao Chỉ | truoc-2025: huyện Mê Linh, Hà Nội | nay: Xã Quang Minh, Thành phố Hà Nội -->
- **192** · Nước Lâm Ấp ra đời — Khu Liên lập nước Lâm Ấp ở miền Trung, tiền thân của vương quốc Chămpa. <!-- sort: 192 -->
- **248** · Khởi nghĩa Bà Triệu — Triệu Thị Trinh khởi nghĩa ở Cửu Chân chống ách đô hộ của nhà Ngô. <!-- sort: 248 | noi: Núi Nưa, Thanh Hoá | toa-do: 19.82, 105.62 | ten-xua: Quận Cửu Chân | truoc-2025: huyện Triệu Sơn, tỉnh Thanh Hoá | nay: Xã Triệu Sơn, Tỉnh Thanh Hóa -->
- **542 – 602** · Lý Bí và nước Vạn Xuân — Lý Bí xưng đế, đặt quốc hiệu Vạn Xuân; Triệu Quang Phục kháng chiến ở đầm Dạ Trạch. <!-- sort: 544 | chuong: van-xuan-544 | noi: Đầm Dạ Trạch, Hưng Yên | toa-do: 20.86, 105.97 | truoc-2025: xã Dạ Trạch, huyện Khoái Châu, tỉnh Hưng Yên | nay: Xã Triệu Việt Vương, Tỉnh Hưng Yên -->
- **722** · Khởi nghĩa Mai Thúc Loan — Mai Thúc Loan khởi nghĩa ở Hoan Châu chống nhà Đường, xưng là Mai Hắc Đế. <!-- sort: 722 | noi: Nam Đàn, Nghệ An | toa-do: 18.70, 105.50 | ten-xua: Hoan Châu | truoc-2025: huyện Nam Đàn, tỉnh Nghệ An | nay: Xã Vạn An, Tỉnh Nghệ An -->
- **Khoảng 776 – 791** · Khởi nghĩa Phùng Hưng — Phùng Hưng ở Đường Lâm nổi dậy, chiếm phủ thành Tống Bình; nhân dân tôn ông là Bố Cái Đại Vương. <!-- sort: 776 | noi: Đường Lâm, Hà Nội | toa-do: 21.15, 105.47 | truoc-2025: xã Đường Lâm, thị xã Sơn Tây, Hà Nội | nay: Phường Sơn Tây, Thành phố Hà Nội -->
- **905** · Khúc Thừa Dụ giành quyền tự chủ — Nhân nhà Đường suy yếu, Khúc Thừa Dụ chiếm thành Tống Bình, tự xưng Tiết độ sứ. <!-- sort: 905 | noi: Tống Bình (Hà Nội) | toa-do: 21.03, 105.85 | ten-xua: Thành Tống Bình | nay: Thành phố Hà Nội -->
- **931** · Dương Đình Nghệ đánh quân Nam Hán — Dương Đình Nghệ từ Ái Châu kéo quân ra đánh đuổi quân Nam Hán, giữ quyền tự chủ. <!-- sort: 931 | noi: Thành Đại La (Hà Nội) | toa-do: 21.03, 105.85 | ten-xua: Thành Đại La | nay: Thành phố Hà Nội -->
- **938** · Chiến thắng Bạch Đằng — Ngô Quyền dùng bãi cọc ngầm và con nước triều đánh tan thủy quân Nam Hán, khép lại thời Bắc thuộc. <!-- sort: 938 | chuong: bach-dang-938 | noi: Sông Bạch Đằng | toa-do: 20.93, 106.77 | truoc-2025: giữa thị xã Quảng Yên (Quảng Ninh) và huyện Thuỷ Nguyên (Hải Phòng) | nay: Phường Phong Cốc, Thành phố Quảng Ninh -->

## Thời Ngô, Đinh, Tiền Lê

Những triều đại đầu tiên của nước độc lập.

- **939** · Ngô Quyền xưng vương — Ngô Quyền xưng vương, đóng đô ở Cổ Loa, mở đầu thời kỳ độc lập. <!-- sort: 939 | noi: Cổ Loa, Hà Nội | toa-do: 21.115, 105.873 | ten-xua: Cổ Loa | truoc-2025: xã Cổ Loa, huyện Đông Anh, Hà Nội | nay: Xã Đông Anh, Thành phố Hà Nội -->
- **966 – 968** · Đinh Bộ Lĩnh dẹp loạn 12 sứ quân — Đinh Bộ Lĩnh từ Hoa Lư lần lượt dẹp yên các sứ quân, thống nhất đất nước. <!-- sort: 966 | noi: Hoa Lư, Ninh Bình | toa-do: 20.29, 105.91 | ten-xua: Hoa Lư | truoc-2025: xã Trường Yên, huyện Hoa Lư, tỉnh Ninh Bình | nay: Phường Tây Hoa Lư, Tỉnh Ninh Bình -->
- **968** · Nước Đại Cồ Việt — Đinh Bộ Lĩnh lên ngôi hoàng đế, đặt quốc hiệu Đại Cồ Việt, đóng đô ở Hoa Lư. <!-- sort: 968 | noi: Hoa Lư, Ninh Bình | toa-do: 20.29, 105.91 | ten-xua: Hoa Lư | truoc-2025: xã Trường Yên, huyện Hoa Lư, tỉnh Ninh Bình | nay: Phường Tây Hoa Lư, Tỉnh Ninh Bình -->
- **981** · Lê Hoàn phá quân Tống — Lê Hoàn đánh bại quân Tống xâm lược ở Chi Lăng và trên sông Bạch Đằng. <!-- sort: 981 | noi: Chi Lăng, Lạng Sơn | toa-do: 21.67, 106.62 | truoc-2025: huyện Chi Lăng, tỉnh Lạng Sơn | nay: Xã Nhân Lý, Tỉnh Lạng Sơn -->

## Thời Lý

Dời đô ra Thăng Long, dựng nền văn hiến Đại Việt.

- **1009** · Lý Công Uẩn lên ngôi — Lý Công Uẩn được triều thần tôn lên ngôi, lập nhà Lý. <!-- sort: 1009 | noi: Hoa Lư, Ninh Bình | toa-do: 20.29, 105.91 | ten-xua: Hoa Lư | truoc-2025: xã Trường Yên, huyện Hoa Lư, tỉnh Ninh Bình | nay: Phường Tây Hoa Lư, Tỉnh Ninh Bình -->
- **1010** · Chiếu dời đô — Lý Thái Tổ dời đô từ Hoa Lư ra thành Đại La, đổi tên là Thăng Long. <!-- sort: 1010 | noi: Thăng Long (Hà Nội) | toa-do: 21.03, 105.84 | ten-xua: Thành Đại La → Thăng Long | nay: Thành phố Hà Nội -->
- **1042** · Bộ luật Hình thư — Bộ luật thành văn đầu tiên được ghi nhận trong sử Việt Nam. <!-- sort: 1042 | noi: Thăng Long (Hà Nội) | toa-do: 21.03, 105.84 | nay: Thành phố Hà Nội -->
- **1054** · Quốc hiệu Đại Việt — Lý Thánh Tông đổi quốc hiệu là Đại Việt. <!-- sort: 1054 | noi: Thăng Long (Hà Nội) | toa-do: 21.03, 105.84 | nay: Thành phố Hà Nội -->
- **1069** · Mở đất về phương Nam — Lý Thánh Tông đánh Chiêm Thành; vua Chiêm dâng ba châu Địa Lý, Ma Linh, Bố Chính. <!-- sort: 1069 | noi: Bố Chính (Quảng Trị) | toa-do: 17.70, 106.40 | ten-xua: Châu Bố Chính | truoc-2025: tỉnh Quảng Bình | nay: Xã Bắc Trạch, Tỉnh Quảng Trị -->
- **1070** · Xây dựng Văn Miếu — Văn Miếu được dựng ở Thăng Long để thờ Khổng Tử và các bậc hiền triết. <!-- sort: 1070 | noi: Văn Miếu, Hà Nội | toa-do: 21.03, 105.84 | ten-xua: Thăng Long | truoc-2025: quận Đống Đa, Hà Nội | nay: Phường Ba Đình, Thành phố Hà Nội -->
- **1075** · Khoa thi đầu tiên — Triều Lý mở khoa thi Minh kinh bác học, khoa thi Nho học đầu tiên. <!-- sort: 1075.1 | noi: Thăng Long (Hà Nội) | toa-do: 21.03, 105.84 | nay: Thành phố Hà Nội -->
- **1075 – 1077** · Kháng chiến chống Tống, phòng tuyến Như Nguyệt — Lý Thường Kiệt chủ động đánh sang đất Tống rồi lập phòng tuyến trên sông Như Nguyệt, đánh bại quân Tống. <!-- sort: 1077 | noi: Sông Như Nguyệt, Bắc Ninh | toa-do: 21.20, 106.07 | ten-xua: Sông Như Nguyệt | truoc-2025: huyện Yên Phong, tỉnh Bắc Ninh | nay: Phường Vũ Ninh, Thành phố Bắc Ninh -->
- **1076** · Quốc Tử Giám — Quốc Tử Giám được lập, được xem là trường đại học đầu tiên của nước ta. <!-- sort: 1076 | noi: Văn Miếu, Hà Nội | toa-do: 21.03, 105.84 | ten-xua: Thăng Long | truoc-2025: quận Đống Đa, Hà Nội | nay: Phường Ba Đình, Thành phố Hà Nội -->

## Thời Trần

Ba lần đánh thắng quân Mông – Nguyên.

- **1226** · Nhà Trần thay nhà Lý — Lý Chiêu Hoàng nhường ngôi cho Trần Cảnh, nhà Trần được thành lập. <!-- sort: 1226 | noi: Thăng Long (Hà Nội) | toa-do: 21.03, 105.84 | nay: Thành phố Hà Nội -->
- **1258** · Kháng chiến chống Mông Cổ lần thứ nhất — Quân dân nhà Trần rút khỏi Thăng Long rồi phản công, đánh tan quân Mông Cổ ở Đông Bộ Đầu. <!-- sort: 1258 | noi: Đông Bộ Đầu, Hà Nội | toa-do: 21.04, 105.86 | nay: Thành phố Hà Nội -->
- **1284** · Hội nghị Diên Hồng — Thượng hoàng Trần Thánh Tông triệu tập các bô lão hỏi kế đánh giặc; cả hội nghị đồng thanh xin đánh. <!-- sort: 1284 | noi: Thăng Long (Hà Nội) | toa-do: 21.03, 105.84 | nay: Thành phố Hà Nội -->
- **1285** · Kháng chiến chống Nguyên lần thứ hai — Những trận Hàm Tử, Chương Dương, Tây Kết; quân Nguyên thua chạy về nước. <!-- sort: 1285 | noi: Hàm Tử, Hưng Yên | toa-do: 20.85, 105.98 | truoc-2025: huyện Khoái Châu, tỉnh Hưng Yên | nay: Xã Triệu Việt Vương, Tỉnh Hưng Yên -->
- **1288** · Bạch Đằng lần nữa — Trần Hưng Đạo dùng lại kế cọc ngầm của Ngô Quyền, tiêu diệt đoàn thuyền của quân Nguyên trên sông Bạch Đằng. <!-- sort: 1288 | noi: Sông Bạch Đằng | toa-do: 20.90, 106.78 | truoc-2025: giữa thị xã Quảng Yên (Quảng Ninh) và huyện Thuỷ Nguyên (Hải Phòng) | nay: Phường Phong Cốc, Thành phố Quảng Ninh -->
- **1306** · Công chúa Huyền Trân về Chiêm Thành — Vua Chiêm dâng hai châu Ô, Lý làm sính lễ cưới công chúa Huyền Trân. <!-- sort: 1306 | noi: Châu Ô, châu Lý (Huế) | toa-do: 16.46, 107.59 | ten-xua: Châu Ô, châu Lý | truoc-2025: tỉnh Quảng Trị và tỉnh Thừa Thiên Huế | nay: Phường Thuận Hóa, Thành phố Huế -->

## Thời Hồ và kháng chiến chống Minh

- **1400** · Nhà Hồ — Hồ Quý Ly lập nhà Hồ, đổi quốc hiệu là Đại Ngu, tiến hành nhiều cải cách. <!-- sort: 1400 | noi: Thành nhà Hồ, Thanh Hoá | toa-do: 20.08, 105.60 | ten-xua: Tây Đô | truoc-2025: huyện Vĩnh Lộc, tỉnh Thanh Hoá | nay: Xã Tây Đô, Tỉnh Thanh Hóa -->
- **1407** · Nhà Minh xâm lược — Quân Minh đánh bại nhà Hồ; nước ta lại bị đô hộ. <!-- sort: 1407 | noi: Thành Đa Bang, Hà Nội | toa-do: 21.20, 105.40 | ten-xua: Thành Đa Bang | truoc-2025: huyện Ba Vì, Hà Nội | nay: Xã Vật Lại, Thành phố Hà Nội -->
- **1407 – 1413** · Khởi nghĩa nhà Hậu Trần — Giản Định Đế, rồi Trùng Quang Đế nối nhau chống quân Minh. <!-- sort: 1408 -->
- **1416** · Hội thề Lũng Nhai — Lê Lợi cùng những người đồng chí hướng thề cùng nhau đánh giặc Minh. <!-- sort: 1416 | noi: Lũng Nhai, Thanh Hoá | toa-do: 19.95, 105.40 | nay: Tỉnh Thanh Hóa -->
- **1418** · Khởi nghĩa Lam Sơn — Lê Lợi dựng cờ khởi nghĩa ở Lam Sơn, xưng là Bình Định Vương. <!-- sort: 1418 | noi: Lam Sơn, Thanh Hoá | toa-do: 19.92, 105.38 | truoc-2025: huyện Thọ Xuân, tỉnh Thanh Hoá | nay: Xã Lam Sơn, Tỉnh Thanh Hóa -->
- **1426** · Trận Tốt Động – Chúc Động — Nghĩa quân Lam Sơn đánh tan đạo quân lớn của Vương Thông ở phía tây nam Đông Quan. <!-- sort: 1426 | noi: Chương Mỹ, Hà Nội | toa-do: 20.88, 105.66 | truoc-2025: huyện Chương Mỹ, Hà Nội | nay: Xã Quảng Bị, Thành phố Hà Nội -->
- **1427** · Chi Lăng – Xương Giang — Viện binh nhà Minh bị tiêu diệt; Vương Thông xin hoà, hội thề ở Đông Quan rồi rút về nước. <!-- sort: 1427 | noi: Chi Lăng, Lạng Sơn | toa-do: 21.67, 106.62 | ten-xua: Ải Chi Lăng | truoc-2025: huyện Chi Lăng, tỉnh Lạng Sơn | nay: Xã Nhân Lý, Tỉnh Lạng Sơn -->
- **1428** · Bình Ngô đại cáo — Lê Lợi lên ngôi, lập nhà Lê; Nguyễn Trãi viết Bình Ngô đại cáo tuyên bố nền độc lập. <!-- sort: 1428 | noi: Đông Kinh (Hà Nội) | toa-do: 21.03, 105.84 | ten-xua: Đông Kinh | nay: Thành phố Hà Nội -->

## Thời Lê sơ

- **1471** · Lê Thánh Tông mở đất phương Nam — Vua Lê Thánh Tông đánh Chămpa, đặt thêm đạo Quảng Nam. <!-- sort: 1471 | noi: Đồ Bàn, Gia Lai | toa-do: 13.92, 109.08 | ten-xua: Thành Đồ Bàn (Vijaya) | truoc-2025: thị xã An Nhơn, tỉnh Bình Định | nay: Phường An Nhơn, Tỉnh Gia Lai -->
- **1479** · Đại Việt sử ký toàn thư — Ngô Sĩ Liên cùng các sử thần hoàn thành bộ quốc sử lớn còn lưu đến nay. <!-- sort: 1479 | noi: Thăng Long (Hà Nội) | toa-do: 21.03, 105.84 | nay: Thành phố Hà Nội -->
- **Thời Hồng Đức** · Bộ luật Hồng Đức — Bộ Quốc triều hình luật được hoàn chỉnh dưới thời Lê Thánh Tông. <!-- sort: 1483 | noi: Thăng Long (Hà Nội) | toa-do: 21.03, 105.84 | nay: Thành phố Hà Nội -->

## Thời Nam – Bắc triều, Trịnh – Nguyễn

Đất nước chia cắt, đồng thời mở rộng về phương Nam.

- **1527** · Nhà Mạc — Mạc Đăng Dung lên ngôi, lập nhà Mạc. <!-- sort: 1527 | noi: Thăng Long (Hà Nội) | toa-do: 21.03, 105.84 | nay: Thành phố Hà Nội -->
- **1533** · Nam triều – Bắc triều — Nguyễn Kim tôn Lê Trang Tông lên ngôi, nhà Lê được dựng lại; chiến tranh Lê – Mạc kéo dài. <!-- sort: 1533 -->
- **1558** · Nguyễn Hoàng vào Thuận Hoá — Nguyễn Hoàng vào trấn thủ Thuận Hoá, mở đầu cơ nghiệp các chúa Nguyễn ở Đàng Trong. <!-- sort: 1558 | noi: Ái Tử, Quảng Trị | toa-do: 16.80, 107.15 | ten-xua: Dinh Ái Tử | truoc-2025: huyện Triệu Phong, tỉnh Quảng Trị | nay: Xã Ái Tử, Tỉnh Quảng Trị -->
- **1592** · Nhà Mạc mất Thăng Long — Quân Lê – Trịnh lấy lại Thăng Long; nhà Mạc rút lên Cao Bằng. <!-- sort: 1592 | noi: Thăng Long (Hà Nội) | toa-do: 21.03, 105.84 | nay: Thành phố Hà Nội -->
- **1627 – 1672** · Chiến tranh Trịnh – Nguyễn — Bảy lần giao tranh lớn; sông Gianh trở thành ranh giới Đàng Trong – Đàng Ngoài. <!-- sort: 1627 | noi: Sông Gianh, Quảng Trị | toa-do: 17.70, 106.45 | ten-xua: Sông Gianh | truoc-2025: tỉnh Quảng Bình | nay: Xã Bắc Trạch, Tỉnh Quảng Trị -->
- **1698** · Nguyễn Hữu Cảnh kinh lược Gia Định — Chúa Nguyễn lập phủ Gia Định, đặt nền hành chính ở vùng đất Nam Bộ. <!-- sort: 1698 | noi: Gia Định (TP. Hồ Chí Minh) | toa-do: 10.80, 106.69 | ten-xua: Phủ Gia Định | truoc-2025: TP. Hồ Chí Minh | nay: Phường Cầu Kiệu, Thành phố Hồ Chí Minh -->
- **1708** · Mạc Cửu dâng đất Hà Tiên — Mạc Cửu đem vùng Hà Tiên quy phục chúa Nguyễn. <!-- sort: 1708 | noi: Hà Tiên, An Giang | toa-do: 10.38, 104.49 | truoc-2025: TP. Hà Tiên, tỉnh Kiên Giang | nay: Phường Tô Châu, Tỉnh An Giang -->

## Thời Tây Sơn

- **1771** · Khởi nghĩa Tây Sơn — Ba anh em Nguyễn Nhạc, Nguyễn Huệ, Nguyễn Lữ dấy binh ở Tây Sơn. <!-- sort: 1771 | noi: Tây Sơn, Gia Lai | toa-do: 13.95, 108.90 | truoc-2025: huyện Tây Sơn, tỉnh Bình Định | nay: Xã Bình An, Tỉnh Gia Lai -->
- **1785** · Rạch Gầm – Xoài Mút — Nguyễn Huệ đánh tan quân Xiêm trên sông Tiền. <!-- sort: 1785 | noi: Sông Tiền, Đồng Tháp | toa-do: 10.33, 106.17 | truoc-2025: huyện Châu Thành, tỉnh Tiền Giang | nay: Xã Ngũ Hiệp, Tỉnh Đồng Tháp -->
- **1788** · Quang Trung lên ngôi — Nguyễn Huệ lên ngôi hoàng đế ở Phú Xuân, hiệu Quang Trung, rồi tiến quân ra Bắc. <!-- sort: 1788 | noi: Phú Xuân (Huế) | toa-do: 16.47, 107.58 | ten-xua: Phú Xuân | truoc-2025: TP. Huế, tỉnh Thừa Thiên Huế | nay: Phường Phú Xuân, Thành phố Huế -->
- **1789** · Ngọc Hồi – Đống Đa — Đầu xuân Kỷ Dậu, quân Tây Sơn đánh tan quân Thanh, giải phóng Thăng Long. <!-- sort: 1789 | noi: Ngọc Hồi – Đống Đa, Hà Nội | toa-do: 20.95, 105.84 | nay: Thành phố Hà Nội -->

## Thời Nguyễn và thời Pháp thuộc

- **1802** · Nhà Nguyễn — Nguyễn Ánh lên ngôi, hiệu Gia Long, đóng đô ở Phú Xuân. <!-- sort: 1802 | noi: Phú Xuân (Huế) | toa-do: 16.47, 107.58 | ten-xua: Phú Xuân | truoc-2025: TP. Huế, tỉnh Thừa Thiên Huế | nay: Phường Phú Xuân, Thành phố Huế -->
- **1804** · Quốc hiệu Việt Nam — Vua Gia Long đặt quốc hiệu là Việt Nam. <!-- sort: 1804 | noi: Phú Xuân (Huế) | toa-do: 16.47, 107.58 | ten-xua: Phú Xuân | truoc-2025: TP. Huế, tỉnh Thừa Thiên Huế | nay: Phường Phú Xuân, Thành phố Huế -->
- **1858** · Pháp nổ súng ở Đà Nẵng — Liên quân Pháp – Tây Ban Nha tấn công bán đảo Sơn Trà, mở đầu cuộc xâm lược. <!-- sort: 1858 | noi: Bán đảo Sơn Trà, Đà Nẵng | toa-do: 16.10, 108.25 | ten-xua: Cửa Hàn | truoc-2025: quận Sơn Trà, TP. Đà Nẵng | nay: Phường Sơn Trà, Thành phố Đà Nẵng -->
- **1862** · Hoà ước Nhâm Tuất — Triều Nguyễn cắt ba tỉnh miền Đông Nam Kỳ cho Pháp. <!-- sort: 1862 | noi: Sài Gòn | toa-do: 10.78, 106.70 | nay: Thành phố Hồ Chí Minh -->
- **1873** · Trận Cầu Giấy lần thứ nhất — Quân Cờ Đen của Lưu Vĩnh Phúc phối hợp quân triều đình phục kích, giết chỉ huy Pháp Francis Garnier. <!-- sort: 1873 | noi: Cầu Giấy, Hà Nội | toa-do: 21.03, 105.80 | truoc-2025: quận Cầu Giấy, Hà Nội | nay: Phường Cầu Giấy, Thành phố Hà Nội -->
- **1884** · Hoà ước Giáp Thân — Hiệp ước Patenôtre đặt Việt Nam dưới sự bảo hộ của Pháp. <!-- sort: 1884 | noi: Huế | toa-do: 16.47, 107.58 | nay: Thành phố Huế -->
- **1884 – 1913** · Khởi nghĩa Yên Thế — Nông dân Yên Thế dưới sự lãnh đạo của Hoàng Hoa Thám kháng chiến gần ba mươi năm. <!-- sort: 1884.5 | noi: Yên Thế, Bắc Ninh | toa-do: 21.53, 106.12 | truoc-2025: huyện Yên Thế, tỉnh Bắc Giang | nay: Xã Đồng Kỳ, Thành phố Bắc Ninh -->
- **1885** · Phong trào Cần Vương — Vua Hàm Nghi xuống chiếu Cần Vương, kêu gọi nhân dân giúp vua chống Pháp. <!-- sort: 1885 | noi: Tân Sở, Quảng Trị | toa-do: 16.75, 107.00 | ten-xua: Sơn phòng Tân Sở | truoc-2025: huyện Cam Lộ, tỉnh Quảng Trị | nay: Xã Cam Lộ, Tỉnh Quảng Trị -->
- **1905** · Phong trào Đông Du — Phan Bội Châu đưa thanh niên sang Nhật Bản học tập để chuẩn bị cứu nước. <!-- sort: 1905 -->
- **1907** · Đông Kinh Nghĩa Thục — Trường học ở Hà Nội cổ động học chữ quốc ngữ, tân học và cải cách xã hội. <!-- sort: 1907 | noi: Hà Nội | toa-do: 21.03, 105.85 | nay: Thành phố Hà Nội -->
- **1911** · Nguyễn Tất Thành ra đi tìm đường cứu nước — Người thanh niên sau này là Chủ tịch Hồ Chí Minh rời bến Nhà Rồng sang phương Tây. <!-- sort: 1911 | noi: Bến Nhà Rồng, TP. Hồ Chí Minh | toa-do: 10.768, 106.707 | truoc-2025: quận 4, TP. Hồ Chí Minh | nay: Phường Xóm Chiếu, Thành phố Hồ Chí Minh -->
- **1930** · Khởi nghĩa Yên Bái — Việt Nam Quốc dân Đảng do Nguyễn Thái Học lãnh đạo khởi nghĩa chống Pháp. <!-- sort: 1930 | noi: Yên Bái, Lào Cai | toa-do: 21.72, 104.90 | truoc-2025: TP. Yên Bái, tỉnh Yên Bái | nay: Phường Yên Bái, Tỉnh Lào Cai -->
- **1930** · Đảng Cộng sản Việt Nam ra đời — Hội nghị hợp nhất các tổ chức cộng sản, thành lập Đảng Cộng sản Việt Nam. <!-- sort: 1930.1 -->
- **1930 – 1931** · Xô viết Nghệ – Tĩnh — Phong trào đấu tranh của nông dân, công nhân ở Nghệ An, Hà Tĩnh. <!-- sort: 1930.5 | noi: Nghệ An, Hà Tĩnh | toa-do: 18.68, 105.68 | nay: Tỉnh Nghệ An -->
- **1940** · Khởi nghĩa Bắc Sơn, Nam Kỳ — Hai cuộc khởi nghĩa vũ trang chống Pháp – Nhật. <!-- sort: 1940 | noi: Bắc Sơn, Lạng Sơn | toa-do: 21.90, 106.32 | truoc-2025: huyện Bắc Sơn, tỉnh Lạng Sơn | nay: Xã Bắc Sơn, Tỉnh Lạng Sơn -->
- **1941** · Mặt trận Việt Minh — Mặt trận Việt Nam Độc lập Đồng minh được thành lập ở Pác Bó, Cao Bằng. <!-- sort: 1941 | noi: Pác Bó, Cao Bằng | toa-do: 22.98, 106.05 | truoc-2025: xã Trường Hà, huyện Hà Quảng, tỉnh Cao Bằng | nay: Xã Trường Hà, Tỉnh Cao Bằng -->

## Thời hiện đại

- **1945** · Cách mạng Tháng Tám — Tổng khởi nghĩa giành chính quyền; ngày 2 tháng 9, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn độc lập. <!-- sort: 1945 | noi: Quảng trường Ba Đình, Hà Nội | toa-do: 21.037, 105.835 | truoc-2025: quận Ba Đình, Hà Nội | nay: Phường Ba Đình, Thành phố Hà Nội -->
- **1946** · Toàn quốc kháng chiến — Cuộc kháng chiến chống thực dân Pháp trở lại xâm lược bùng nổ trên cả nước. <!-- sort: 1946 | noi: Hà Nội | toa-do: 21.03, 105.85 | nay: Thành phố Hà Nội -->
- **1954** · Điện Biên Phủ và Hiệp định Genève — Chiến thắng Điện Biên Phủ buộc Pháp ký hiệp định; đất nước tạm chia cắt ở vĩ tuyến 17. <!-- sort: 1954 | noi: Điện Biên Phủ | toa-do: 21.39, 103.02 | truoc-2025: TP. Điện Biên Phủ, tỉnh Điện Biên | nay: Phường Điện Biên Phủ, Tỉnh Điện Biên -->
- **1968** · Tổng tiến công Tết Mậu Thân — Đợt tấn công đồng loạt vào các đô thị miền Nam. <!-- sort: 1968 -->
- **1972** · Điện Biên Phủ trên không — Mười hai ngày đêm đánh trả chiến dịch ném bom B-52 xuống Hà Nội, Hải Phòng. <!-- sort: 1972 | noi: Hà Nội | toa-do: 21.03, 105.85 | nay: Thành phố Hà Nội -->
- **1973** · Hiệp định Paris — Hiệp định về chấm dứt chiến tranh, lập lại hoà bình ở Việt Nam được ký kết. <!-- sort: 1973 -->
- **1975** · Thống nhất đất nước — Ngày 30 tháng 4, chiến dịch Hồ Chí Minh kết thúc, hai miền Nam Bắc thống nhất. <!-- sort: 1975 | noi: Dinh Độc Lập, TP. Hồ Chí Minh | toa-do: 10.777, 106.695 | truoc-2025: quận 1, TP. Hồ Chí Minh | nay: Phường Bến Thành, Thành phố Hồ Chí Minh -->
- **1976** · Nước Cộng hoà Xã hội chủ nghĩa Việt Nam — Quốc hội khoá VI quyết định đặt tên nước là Cộng hoà Xã hội chủ nghĩa Việt Nam. <!-- sort: 1976 | noi: Hà Nội | toa-do: 21.03, 105.85 | nay: Thành phố Hà Nội -->
- **1979** · Bảo vệ biên giới — Các cuộc chiến bảo vệ biên giới Tây Nam và biên giới phía Bắc. <!-- sort: 1979 -->
- **1986** · Đổi mới — Đại hội VI của Đảng khởi xướng công cuộc Đổi mới. <!-- sort: 1986 | noi: Hà Nội | toa-do: 21.03, 105.85 | nay: Thành phố Hà Nội -->
- **1995** · Gia nhập ASEAN — Việt Nam trở thành thành viên Hiệp hội các quốc gia Đông Nam Á. <!-- sort: 1995 -->
- **2007** · Gia nhập WTO — Việt Nam trở thành thành viên Tổ chức Thương mại Thế giới. <!-- sort: 2007 -->
