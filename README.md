# Lược sử Việt Nam — MVP Chương I: Bạch Đằng 938

Trải nghiệm 3D kể chuyện bằng cuộn trang. Người xem đi qua 8 phân cảnh, và ở phân cảnh "Chờ nước rút" tự kéo con nước để thấy mưu kế của Ngô Quyền diễn ra.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build && pnpm start
```

## Cấu trúc

| Đường dẫn | Vai trò |
|---|---|
| `src/content/bach-dang.ts` | Toàn bộ lời kể + trạng thái cảnh 3D của từng phân cảnh (camera, thủy triều, đoàn thuyền…). Sửa nội dung ở đây, không cần đụng code 3D. |
| `src/components/Story.tsx` | Trang kể chuyện: cuộn mượt (Lenis), dòng thời gian, nút Nghe kể / Âm thanh. HTML được prerender tĩnh. |
| `src/components/SceneCanvas.tsx` | Mount engine 3D, tải động (`ssr: false`) sau khi chữ đã hiển thị. |
| `src/scene/engine.ts` | Vòng render: nội suy trạng thái theo vị trí cuộn, giảm chấn camera, tự hạ độ phân giải khi FPS tụt, dừng khi tab ẩn. |
| `src/scene/*` | Địa hình, nước (shader), đảo đá vôi, bãi cọc, đoàn thuyền, bầu trời, bụi vàng — tất cả sinh bằng code, không tải model. |
| `src/lib/narrator.ts` | Giọng kể: file audio nếu có (`chapter.audio`), không thì Web Speech API tiếng Việt. |
| `src/lib/ambient.ts` | Âm thanh nền tổng hợp bằng WebAudio (sông, gió, trống đồng theo cường độ trận đánh). |

## Hiệu năng

- Chữ và layout là HTML tĩnh — đọc được ngay, tốt cho SEO, không phụ thuộc WebGL.
- Three.js nằm ở chunk riêng (~140 KB gzip), tải sau.
- Không có file 3D/ảnh/âm thanh nào cần tải: cảnh và âm thanh đều sinh tại chỗ.
- Cọc và thuyền dùng `InstancedMesh` (mỗi loại 1 draw call); ma trận cọc chỉ cập nhật khi tiến độ thay đổi.
- Độ phân giải tự điều chỉnh theo thời gian khung hình; cấu hình nhẹ hơn cho điện thoại.
- Không dùng `backdrop-filter` trên canvas động (rất tốn GPU) — dùng gradient.
- Tôn trọng `prefers-reduced-motion`.

## Giọng đọc

MVP dùng giọng tiếng Việt có sẵn của trình duyệt/hệ điều hành (Edge: HoaiMy/NamMinh neural; macOS/iOS: Linh; Android: Google). Để có giọng hay và đồng nhất trên mọi máy: tạo trước file mp3 cho từng phân cảnh bằng một dịch vụ TTS tiếng Việt, đặt vào `public/audio/` và khai báo `audio: "/audio/<id>.mp3"` trong `bach-dang.ts`. Lời kể là nội dung tĩnh nên không cần backend chạy thật.

## Lưu ý nội dung

Lời kể dựa trên Đại Việt sử ký toàn thư, Việt sử lược, Khâm định Việt sử thông giám cương mục — cần chuyên gia sử học thẩm định trước khi phát hành.
