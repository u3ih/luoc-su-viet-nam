// Mã định danh dùng chung cho thời kỳ (neo `#thoi-ly`) và chuỗi tìm kiếm không dấu — chạy được cả ở server lẫn client.

/** "Thời Nam – Bắc triều" → "thoi-nam-bac-trieu". */
export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Chuỗi để so khớp khi tìm: bỏ dấu, chữ thường — gõ "tran hung dao" vẫn ra "Trần Hưng Đạo". */
export const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();
