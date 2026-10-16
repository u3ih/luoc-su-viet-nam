# Cùng viết Lược sử Việt Nam

Cảm ơn bạn đã quan tâm! Đây là dự án phi lợi nhuận của cộng đồng. Mục tiêu là để người Việt, nhất là các bạn trẻ, thấy lịch sử gần gũi và sống động hơn.

## Cách nhanh nhất: sửa trên GitHub, không cần cài gì

1. Mở file lời kể, ví dụ [`content/01-bach-dang-938/story.md`](content/01-bach-dang-938/story.md).
2. Bấm biểu tượng ✏️ (Edit). GitHub sẽ tự tạo bản sao (fork) cho bạn.
3. Sửa câu chữ, rồi bấm **Propose changes** và **Create pull request**.
4. Ghi rõ bạn sửa gì và **dựa trên nguồn nào**.

Trên trang web, cuối mỗi chương cũng có nút **"Góp ý, sửa nội dung"** dẫn thẳng tới file đó.

## Các kiểu đóng góp

### 📜 Viết hoặc sửa lời kể

- Định dạng file: [`content/README.md`](content/README.md).
- Quy tắc nội dung (quan trọng):
  - **Có nguồn** cho mọi sự kiện, con số, tên riêng.
  - **Không bịa** lời thoại hay chi tiết. Muốn giàu hình ảnh thì tả bối cảnh có thật.
  - **Phân biệt sử và truyền thuyết**, nêu rõ chỗ còn tranh luận.
  - **Diễn ý** thay vì chép dài bản dịch hiện đại; ghi `(diễn ý)` ở dòng nguồn.
  - Câu ngắn, có nhịp, hợp để đọc thành tiếng.

### 🆕 Viết một chương mới

1. [Mở đề xuất chương](../../issues/new?template=de-xuat-chuong.yml) để mọi người biết và tránh trùng việc.
2. Chép thư mục mẫu `content/_mau/` thành `content/NN-<ma-chuong>/`.
3. Viết `story.md` trước. Phần cảnh 3D có thể để người khác làm sau, dùng cảnh mẫu trong lúc chờ.
4. Để `status: draft` cho đến khi nội dung được thẩm định.

### 🔍 Thẩm định sử liệu

Đọc các chương và [báo chỗ chưa chính xác](../../issues/new?template=bao-sai-su-lieu.yml). Ghi rõ đoạn nào, sai thế nào, theo nguồn nào. Chúng tôi rất cần các thầy cô và người nghiên cứu sử.

### 🎨 Làm model 3D bằng Blender

Xem [`blender/README.md`](blender/README.md). Bạn có thể viết script Python (khuyến khích, vì dễ review và dễ sửa) hoặc làm tay file `.blend`. Ưu tiên tính chính xác lịch sử: kiểu thuyền, nhà, trang phục, vũ khí phải đúng thời kỳ, kèm nguồn tham khảo hình ảnh.

### 💻 Lập trình

Đọc [`AGENTS.md`](AGENTS.md). Đây là quy tắc chung cho cả người và AI agent. Tóm tắt:

- Code chung đặt trong `src/core/`, code riêng của chương đặt trong `content/<chương>/`.
- Chữ chỉ nằm trong `story.md`.
- Trước khi gửi PR: `pnpm typecheck && pnpm build`, rồi xem thử trên cả máy tính lẫn điện thoại.

### 🎙 Lồng tiếng

Thu giọng kể cho từng phân cảnh (mp3, mono, khoảng 64–96 kbps). Đặt file vào `public/audio/<ma-chuong>/<id>.mp3` và thêm `audio: /audio/<ma-chuong>/<id>.mp3` vào dòng chú thích của phân cảnh.

## Dùng AI agent để đóng góp

Bạn có thể dùng Claude Code, Cursor, Copilot… Các agent sẽ tự đọc `AGENTS.md`. Một vài gợi ý câu lệnh:

- _"Đọc AGENTS.md và content/README.md, rồi tạo chương mới về Chiếu dời đô 1010 từ content/_mau. Chỉ viết những chi tiết có nguồn; chỗ nào không chắc thì ghi TODO cần thẩm định."_
- _"Thêm model Blender cây đa đầu làng theo hướng dẫn trong AGENTS.md mục 7."_

**Bạn vẫn chịu trách nhiệm về nội dung AI viết ra.** Hãy tự kiểm tra từng chi tiết lịch sử với nguồn trước khi gửi PR.

## Quy trình review

- PR nội dung: cần ít nhất một người review đối chiếu với nguồn.
- PR code: CI phải xanh (`content --check`, `typecheck`, `build`).
- Chúng tôi trả lời trong vòng một tuần. Nếu lâu hơn, cứ nhắc nhé!

## Giấy phép

Khi gửi PR, bạn đồng ý cấp phép phần đóng góp của mình theo giấy phép của dự án: mã nguồn theo [MIT](LICENSE), nội dung (lời kể, giọng đọc, model 3D) theo [CC BY-SA 4.0](LICENSE-CONTENT.md). Chỉ gửi những gì bạn có quyền chia sẻ.

## Ứng xử

Tôn trọng nhau, tranh luận bằng sử liệu. Lịch sử có nhiều góc nhìn: hãy trình bày chúng một cách công bằng, có nguồn, không công kích cá nhân.
