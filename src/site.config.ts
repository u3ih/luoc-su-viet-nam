// Cấu hình chung của site. Sửa khi đổi tên miền hoặc repo.
export const site = {
  name: "Lược sử Việt Nam",
  description: "Học lịch sử Việt Nam qua những câu chuyện 3D tương tác.",
  /** Tên miền chính thức (dùng cho nút "Xem trực quan" trong story.md). */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://luocsu.u3ih.io.vn",
  /** Repo GitHub — dùng cho link "Đọc bản chữ" / "Sửa trên GitHub". */
  repo: "https://github.com/u3ih/luoc-su-viet-nam",
  branch: "main",
  /** Lưu ý hiện ở cuối mọi trang chương và trong llms*.txt — luôn có, không phụ thuộc story.md. */
  aiNotice: "Nội dung do AI tổng hợp từ nhiều nguồn, chưa được chuyên gia kiểm chứng. Hãy đối chiếu với nguồn tham khảo ở trên trước khi trích dẫn.",
  license: {
    code: { name: "MIT", url: "https://opensource.org/license/mit" },
    content: { name: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" },
  },
};

// Các sự kiện lịch sử chờ viết thành chương: xem content/lo-trinh.md (trang /lo-trinh).
