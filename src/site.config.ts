// Cấu hình chung của site. Sửa khi đổi tên miền hoặc repo.
export const site = {
  name: "Lược sử Việt Nam",
  description: "Học lịch sử Việt Nam qua những câu chuyện 3D tương tác.",
  /** Tên miền chính thức (dùng cho nút "Xem trực quan" trong story.md). */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://luocsu.u3ih.io.vn",
  /** Repo GitHub — dùng cho link "Đọc bản chữ" / "Sửa trên GitHub". */
  repo: "https://github.com/u3ih/luoc-su-viet-nam",
  branch: "main",
  license: {
    code: { name: "MIT", url: "https://opensource.org/license/mit" },
    content: { name: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" },
  },
};

/** Các chương đang lên kế hoạch — hiển thị ở trang chủ, mời cộng đồng nhận viết. */
export const roadmap = [
  { numeral: "II", title: "Chiếu dời đô", year: "1010", era: "Nhà Lý" },
  { numeral: "III", title: "Phòng tuyến Như Nguyệt", year: "1077", era: "Nhà Lý" },
  { numeral: "IV", title: "Bạch Đằng lần nữa", year: "1288", era: "Nhà Trần" },
  { numeral: "V", title: "Hội thề Lũng Nhai", year: "1416", era: "Khởi nghĩa Lam Sơn" },
  { numeral: "VI", title: "Ngọc Hồi – Đống Đa", year: "1789", era: "Tây Sơn" },
];
