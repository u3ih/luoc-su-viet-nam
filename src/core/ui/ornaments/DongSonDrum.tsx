// Mặt trống đồng Ngọc Lũ — dùng bản vẽ lại hoa văn có sẵn, không tự vẽ, để giữ đúng hiện vật:
// mặt trời 14 tia, 16 vành; vành cảnh sinh hoạt chia hai nửa đối xứng qua tâm (đoàn người hoá trang
// lông chim → nhà mái vòm → giã gạo → nhà sàn mái cong → đánh trống đồng), vành 20 hươu và 14 chim,
// vành 18 chim Lạc bay xen 18 chim đứng; người và vật chân hướng ra mép, đi ngược chiều kim đồng hồ.
//
// Nguồn hình: "Trống Đồng Đông Sơn (alt).svg", bộ sưu tập "Văn Lang Hoạ Đồ", Wikimedia Commons,
// public domain — https://commons.wikimedia.org/wiki/File:Tr%E1%BB%91ng_%C4%90%E1%BB%93ng_%C4%90%C3%B4ng_S%C6%A1n_(alt).svg
// Đã đảo (phần nổi của hoa văn thành phần đặc), bỏ viền trơn, tối ưu bằng svgo:
// public/hoa-van/mat-trong-ngoc-lu.svg. Đối chiếu bố cục: Bảo tàng Lịch sử và Văn hoá (ĐHKHXH&NV),
// "Trống đồng Ngọc Lũ".
//
// Hình làm mặt nạ CSS nên tô bằng `color` của phần tử (currentColor), quay bằng transform như cũ.
export default function DongSonDrum({ className }: { className?: string }) {
  return <div className={`dong-son-drum ${className ?? ""}`} aria-hidden="true" />;
}
